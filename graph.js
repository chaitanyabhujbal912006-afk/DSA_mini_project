/**
 * graph.js — Interactive Force-Directed Network Graph
 *
 * Algorithm:
 * - Repulsion between all node pairs (Coulomb's law simulation)
 * - Attraction along edges (spring simulation)
 * - Velocity + damping for smooth animation
 * - Canvas 2D rendering with requestAnimationFrame
 */

const COLORS = [
  '#6366f1', '#a855f7', '#ec4899', '#06b6d4',
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'
];

export class NetworkGraph {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.nodes = [];      // { id, label, x, y, vx, vy, color, radius }
    this.edges = [];      // { source, target }
    this.animId = null;
    this.dragging = null;
    this.hovering = null;
    this.highlighted = null; // highlighted node key from BFS

    // Physics constants
    this.repulsion    = 5000;
    this.attraction   = 0.05;
    this.damping      = 0.85;
    this.centerPull   = 0.006;
    this.minDist      = 80;

    this._bindEvents();
    this._resizeObserver();
  }

  // ── Data ──────────────────────────────────────────────────────────────────

  setData(users, adjacencyList) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2, cy = h / 2;

    // Keep existing positions if node already exists
    const existingPos = {};
    this.nodes.forEach(n => { existingPos[n.id] = { x: n.x, y: n.y }; });

    this.nodes = users.map((u, i) => {
      const pos = existingPos[u.username];
      const angle = (i / users.length) * Math.PI * 2;
      const r = Math.min(w, h) * 0.3;
      return {
        id: u.username,
        label: u.displayName,
        friendsCount: u.friendsCount,
        x: pos ? pos.x : cx + Math.cos(angle) * r + (Math.random() - 0.5) * 40,
        y: pos ? pos.y : cy + Math.sin(angle) * r + (Math.random() - 0.5) * 40,
        vx: 0, vy: 0,
        color: COLORS[i % COLORS.length],
        radius: Math.max(24, Math.min(42, 24 + u.friendsCount * 5))
      };
    });

    this.edges = [];
    adjacencyList.forEach((friends, key) => {
      for (const fKey of friends) {
        if (key < fKey) { // avoid duplicates
          this.edges.push({ source: key, target: fKey });
        }
      }
    });

    this.start();
  }

  highlightBFS(levels) {
    this._bfsLevels = levels;
    this._bfsStep = -1;
    this._bfsColors = ['#ffffff', '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];
    this.nodes.forEach(n => n.bfsColor = null);
  }

  stepBFS() {
    if (!this._bfsLevels) return false;
    this._bfsStep++;
    if (this._bfsStep >= this._bfsLevels.length) {
      this._bfsLevels = null;
      return false;
    }
    const levelKeys = this._bfsLevels[this._bfsStep];
    const color = this._bfsColors[this._bfsStep % this._bfsColors.length];
    this.nodes.forEach(n => {
      if (levelKeys.includes(n.id)) n.bfsColor = color;
    });
    return true;
  }

  resetHighlight() {
    this.nodes.forEach(n => { n.bfsColor = null; n.highlighted = false; });
    this._bfsLevels = null;
  }

  highlightNode(userId) {
    this.nodes.forEach(n => {
      n.highlighted = (n.id === userId.toLowerCase());
    });
  }

  // ── Physics ───────────────────────────────────────────────────────────────

  _tick() {
    const { repulsion, attraction, damping, centerPull, minDist } = this;
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    const nodeMap = {};
    this.nodes.forEach(n => { nodeMap[n.id] = n; });

    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const a = this.nodes[i], b = this.nodes[j];
        let dx = b.x - a.x, dy = b.y - a.y;
        let dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dist < minDist) dist = minDist;
        const force = repulsion / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx -= fx; a.vy -= fy;
        b.vx += fx; b.vy += fy;
      }
    }

    this.edges.forEach(e => {
      const a = nodeMap[e.source], b = nodeMap[e.target];
      if (!a || !b) return;
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (dist - 160) * attraction;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      a.vx += fx; a.vy += fy;
      b.vx -= fx; b.vy -= fy;
    });

    this.nodes.forEach(n => {
      n.vx += (cx - n.x) * centerPull;
      n.vy += (cy - n.y) * centerPull;
    });

    const pad = 60;
    this.nodes.forEach(n => {
      if (this.dragging === n) { n.vx = 0; n.vy = 0; return; }
      n.vx *= damping;
      n.vy *= damping;
      n.x += n.vx;
      n.y += n.vy;
      n.x = Math.max(pad + n.radius, Math.min(this.canvas.width - pad - n.radius, n.x));
      n.y = Math.max(pad + n.radius, Math.min(this.canvas.height - pad - n.radius, n.y));
    });
  }

  // ── Rendering ─────────────────────────────────────────────────────────────

  _draw() {
    const ctx = this.ctx;
    const w = this.canvas.width, h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    const nodeMap = {};
    this.nodes.forEach(n => { nodeMap[n.id] = n; });

    // Draw edges
    this.edges.forEach(e => {
      const a = nodeMap[e.source], b = nodeMap[e.target];
      if (!a || !b) return;

      const isSpecial = a.highlighted || b.highlighted || a.bfsColor || b.bfsColor;

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      
      const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
      if (isSpecial) {
        grad.addColorStop(0, hexToRgba(a.bfsColor || a.color, 0.6));
        grad.addColorStop(1, hexToRgba(b.bfsColor || b.color, 0.6));
      } else {
        grad.addColorStop(0, 'rgba(100, 116, 139, 0.1)');
        grad.addColorStop(1, 'rgba(100, 116, 139, 0.1)');
      }

      ctx.strokeStyle = grad;
      ctx.lineWidth = isSpecial ? 3 : 1.5;
      ctx.lineCap = 'round';
      ctx.stroke();
    });

    // Draw nodes
    this.nodes.forEach(n => {
      const isHovered = this.hovering === n;
      const isSpec = n.highlighted || n.bfsColor;
      const color = n.bfsColor || n.color;
      const r = n.radius + (isHovered ? 6 : 0);

      ctx.save();
      
      // Shadow / Glow
      ctx.shadowBlur = isHovered || isSpec ? 25 : 0;
      ctx.shadowColor = color;

      // Glow Ring
      if (isHovered || isSpec) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, r + 8, 0, Math.PI * 2);
        ctx.strokeStyle = hexToRgba(color, 0.3);
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Outer Circle
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = isHovered || isSpec ? hexToRgba(color, 0.15) : 'rgba(10, 10, 15, 0.85)';
      ctx.fill();
      ctx.strokeStyle = isHovered || isSpec ? color : hexToRgba(color, 0.6);
      ctx.lineWidth = isHovered || isSpec ? 4 : 2;
      ctx.stroke();

      ctx.restore();

      // Initials
      ctx.fillStyle = isHovered || isSpec ? '#fff' : color;
      ctx.font = `800 ${Math.max(12, r * 0.5)}px Outfit, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(n.label.substring(0, 2).toUpperCase(), n.x, n.y);

      // Label below
      if (isHovered || this.nodes.length < 15) {
        ctx.fillStyle = isHovered ? '#fff' : 'rgba(255,255,255,0.6)';
        ctx.font = `${isHovered ? 700 : 500} 13px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(n.label, n.x, n.y + r + 10);
      }

      // Tooltip for hovered
      if (isHovered) {
        const txt = `${n.label} (@${n.id})`;
        const tw = ctx.measureText(txt).width + 24;
        ctx.fillStyle = 'rgba(0,0,0,0.9)';
        ctx.beginPath();
        ctx.roundRect(n.x - tw/2, n.y - r - 45, tw, 28, 10);
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.fillStyle = '#fff';
        ctx.font = '600 12px Inter, sans-serif';
        ctx.fillText(txt, n.x, n.y - r - 31);
      }
    });
  }

  // ── Animation loop ────────────────────────────────────────────────────────

  start() {
    if (this.animId) cancelAnimationFrame(this.animId);
    let ticks = 0;
    const loop = () => {
      this._tick();
      this._draw();
      ticks++;
      // After 400 ticks with no interaction, slow down to save CPU
      if (ticks < 400 || this.dragging || this.hovering) {
        this.animId = requestAnimationFrame(loop);
      } else {
        // idle: just draw, no physics
        this.animId = requestAnimationFrame(() => { this._draw(); this.animId = null; });
      }
    };
    this.animId = requestAnimationFrame(loop);
  }

  wake() {
    if (!this.animId) this.start();
  }

  stop() {
    if (this.animId) { cancelAnimationFrame(this.animId); this.animId = null; }
  }

  // ── Events ────────────────────────────────────────────────────────────────

  _nodeAt(x, y) {
    return this.nodes.find(n => {
      const dx = n.x - x, dy = n.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 4;
    }) || null;
  }

  _canvasXY(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  _bindEvents() {
    const c = this.canvas;

    c.addEventListener('mousedown', e => {
      const { x, y } = this._canvasXY(e);
      const node = this._nodeAt(x, y);
      if (node) { this.dragging = node; this.wake(); }
    });

    c.addEventListener('mousemove', e => {
      const { x, y } = this._canvasXY(e);
      if (this.dragging) {
        this.dragging.x = x;
        this.dragging.y = y;
      }
      const prev = this.hovering;
      this.hovering = this._nodeAt(x, y);
      c.style.cursor = this.hovering ? 'grab' : 'default';
      if (this.hovering !== prev) this.wake();
    });

    c.addEventListener('mouseup', () => { this.dragging = null; });
    c.addEventListener('mouseleave', () => { this.dragging = null; this.hovering = null; });
  }

  _resizeObserver() {
    const resize = () => {
      const parent = this.canvas.parentElement;
      this.canvas.width  = parent.clientWidth;
      this.canvas.height = parent.clientHeight;
      this.wake();
    };
    resize();
    new ResizeObserver(resize).observe(this.canvas.parentElement);
  }
}
