import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

type Point2D = { x: number; y: number; scale: number };
type Point3D = { x: number; z: number; height?: number };
type Player = {
  number: string;
  x: number;
  z: number;
  color: string;
  trim: string;
  angle: number;
  role: 'receiver' | 'teammate' | 'defender' | 'support';
};

@Component({
  selector: 'app-ranking-jugada-3d',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="scene-frame" [attr.data-scene-3d]="sceneId" [attr.data-selected-choice-3d]="selectedChoiceId || ''">
      <canvas
        #sceneCanvas
        class="scene-canvas"
        role="img"
        [attr.aria-label]="sceneDescription()"
        data-testid="lesson-3d-canvas"></canvas>
      <div class="scene-watermark"><span></span> ANIMACIÓN 3D · VISTA DE JUEGO</div>
      <div class="scene-legend" aria-hidden="true">
        <span><i class="legend-blue"></i> Equipo</span>
        <span><i class="legend-yellow"></i> Receptor</span>
        <span><i class="legend-red"></i> Presión rival</span>
      </div>
      <div class="scene-subtitle" aria-live="polite">
        @if (sceneId === 'scan-before-receive') {
          <strong>Antes del pase: mira alrededor</strong>
          <span>Comprueba dónde está la presión y dónde queda el espacio.</span>
        } @else {
          <strong>Primer toque: sal de la presión</strong>
          <span>Elige una opción para ver cómo cambia la jugada.</span>
        }
      </div>
    </div>
  `,
  styleUrl: './ranking-jugada-3d.component.scss',
})
export class RankingJugada3dComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('sceneCanvas', { static: true }) private canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() sceneId = 'scan-before-receive';
  @Input() selectedChoiceId: string | null = null;
  @Input() playing = false;

  private context: CanvasRenderingContext2D | null = null;
  private resizeObserver?: ResizeObserver;
  private animationFrame = 0;
  private elapsedMs = 0;
  private previousFrameMs = 0;
  private initialized = false;

  ngAfterViewInit(): void {
    this.context = this.canvasRef.nativeElement.getContext('2d', { alpha: false });
    if (!this.context) return;

    this.initialized = true;
    this.resizeObserver = new ResizeObserver(() => this.drawFrame());
    this.resizeObserver.observe(this.canvasRef.nativeElement);
    this.drawFrame();
    this.syncPlayback();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sceneId'] && !changes['sceneId'].firstChange) this.elapsedMs = 0;
    if (this.initialized) {
      this.drawFrame();
      this.syncPlayback();
    }
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationFrame);
    this.resizeObserver?.disconnect();
  }

  sceneDescription(): string {
    return this.sceneId === 'scan-before-receive'
      ? 'Animación 3D de un pase hacia el jugador diez, que escanea por encima del hombro mientras se acerca un defensor.'
      : 'Animación 3D del primer toque del jugador diez; compara una salida hacia el espacio con controlar hacia la presión o detener el balón.';
  }

  private syncPlayback(): void {
    cancelAnimationFrame(this.animationFrame);
    this.animationFrame = 0;
    if (!this.playing || !this.context) return;
    this.previousFrameMs = performance.now();
    this.animationFrame = requestAnimationFrame(this.animate);
  }

  private animate = (now: number): void => {
    const delta = Math.min(now - this.previousFrameMs, 48);
    this.previousFrameMs = now;
    this.elapsedMs += delta;
    this.drawFrame();
    if (this.playing) this.animationFrame = requestAnimationFrame(this.animate);
  };

  private drawFrame(): void {
    const canvas = this.canvasRef?.nativeElement;
    const ctx = this.context;
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    ctx.setTransform(width / 960, 0, 0, height / 540, 0, 0);
    ctx.clearRect(0, 0, 960, 540);
    this.drawBackdrop(ctx);
    this.drawPitch(ctx);

    const phase = (this.elapsedMs % 6000) / 6000;
    const players = this.currentPlayers(phase);
    this.drawMovementHints(ctx, phase);
    [...players].sort((a, b) => a.x + a.z - (b.x + b.z)).forEach((player) => this.drawPlayer(ctx, player, phase));
    this.drawBall(ctx, phase);
    this.drawSceneCallout(ctx, phase);
  }

  private drawBackdrop(ctx: CanvasRenderingContext2D): void {
    const sky = ctx.createLinearGradient(0, 0, 0, 540);
    sky.addColorStop(0, '#102b36');
    sky.addColorStop(0.52, '#234d49');
    sky.addColorStop(1, '#102f28');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 960, 540);

    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#d1fae5';
    for (let index = 0; index < 16; index += 1) {
      const x = 34 + index * 60;
      ctx.beginPath();
      ctx.ellipse(x, 98 + Math.sin(index * 1.4) * 8, 12, 22, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private project(x: number, z: number, height = 0): Point2D {
    const perspective = 1 + (z + 5) * 0.018;
    return {
      x: 480 + (x - z) * 33 * perspective,
      y: 305 + (x + z) * 14.3 * perspective - height * 58 * perspective,
      scale: perspective,
    };
  }

  private drawPitch(ctx: CanvasRenderingContext2D): void {
    const corners = [this.project(-6.5, -5), this.project(6.5, -5), this.project(6.5, 5), this.project(-6.5, 5)];
    ctx.beginPath();
    corners.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
    ctx.closePath();
    const grass = ctx.createLinearGradient(170, 130, 790, 455);
    grass.addColorStop(0, '#23785b');
    grass.addColorStop(0.48, '#1a684f');
    grass.addColorStop(1, '#10513f');
    ctx.fillStyle = grass;
    ctx.fill();
    ctx.save();
    ctx.clip();

    for (let stripe = -5; stripe < 5; stripe += 2) {
      const band = [this.project(-6.5, stripe), this.project(6.5, stripe), this.project(6.5, stripe + 2), this.project(-6.5, stripe + 2)];
      ctx.beginPath();
      band.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
      ctx.closePath();
      ctx.fillStyle = stripe % 4 === -1 ? 'rgba(180, 255, 210, 0.045)' : 'rgba(3, 36, 30, 0.045)';
      ctx.fill();
    }

    ctx.strokeStyle = 'rgba(226, 255, 242, 0.7)';
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    corners.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
    ctx.closePath();
    ctx.stroke();
    this.drawWorldLine(ctx, { x: -6.5, z: 0 }, { x: 6.5, z: 0 });
    this.drawWorldLine(ctx, { x: 0, z: -5 }, { x: 0, z: 5 });
    this.drawWorldEllipse(ctx, 0, 0, 1.35, 1.35);
    this.drawWorldRect(ctx, -6.5, -3.8, 2.1, 3.2);
    this.drawWorldRect(ctx, 4.4, -3.8, 2.1, 3.2);
    this.drawWorldRect(ctx, -6.5, -5, 0.72, 1.5);
    this.drawWorldRect(ctx, 5.78, -5, 0.72, 1.5);
    ctx.restore();

    this.drawGoal(ctx);
    const vignette = ctx.createRadialGradient(480, 270, 90, 480, 270, 580);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(1,16,20,0.42)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, 960, 540);
  }

  private drawWorldLine(ctx: CanvasRenderingContext2D, start: Point3D, end: Point3D): void {
    const a = this.project(start.x, start.z);
    const b = this.project(end.x, end.z);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  private drawWorldRect(ctx: CanvasRenderingContext2D, x: number, z: number, width: number, depth: number): void {
    const points = [this.project(x, z), this.project(x + width, z), this.project(x + width, z + depth), this.project(x, z + depth)];
    ctx.beginPath();
    points.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
    ctx.closePath();
    ctx.stroke();
  }

  private drawWorldEllipse(ctx: CanvasRenderingContext2D, x: number, z: number, radiusX: number, radiusZ: number): void {
    ctx.beginPath();
    for (let index = 0; index <= 56; index += 1) {
      const angle = (Math.PI * 2 * index) / 56;
      const point = this.project(x + Math.cos(angle) * radiusX, z + Math.sin(angle) * radiusZ);
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
  }

  private drawGoal(ctx: CanvasRenderingContext2D): void {
    const left = this.project(-1.15, -5, 0);
    const right = this.project(1.15, -5, 0);
    const leftTop = this.project(-1.15, -5, 1.25);
    const rightTop = this.project(1.15, -5, 1.25);
    ctx.save();
    ctx.strokeStyle = 'rgba(239, 255, 248, .62)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(left.x, left.y);
    ctx.lineTo(leftTop.x, leftTop.y);
    ctx.lineTo(rightTop.x, rightTop.y);
    ctx.lineTo(right.x, right.y);
    ctx.stroke();
    ctx.restore();
  }

  private currentPlayers(phase: number): Player[] {
    const moving = Math.min(1, Math.max(0, phase * 3.5));
    const pressure = this.sceneId === 'first-touch-exit' ? Math.min(1, this.elapsedMs / 1900) : moving;
    return [
      { number: '8', x: -3.8, z: 0.85, color: '#267fe5', trim: '#d8ecff', angle: -0.45, role: 'teammate' },
      { number: '10', x: 0, z: 0, color: '#f5c400', trim: '#fff3ae', angle: this.sceneId === 'scan-before-receive' ? -0.52 + Math.sin(phase * Math.PI * 2) * 0.12 : 0.42, role: 'receiver' },
      { number: '4', x: 2.35 - pressure * 0.8, z: 1.35 - pressure * 0.22, color: '#e84c68', trim: '#ffe0e7', angle: -0.72, role: 'defender' },
      { number: '7', x: 3.75, z: -2.55, color: '#267fe5', trim: '#d8ecff', angle: -0.1, role: 'support' },
    ];
  }

  private drawPlayer(ctx: CanvasRenderingContext2D, player: Player, phase: number): void {
    const stride = this.playing ? Math.sin(this.elapsedMs / 145 + Number(player.number)) * 0.12 : 0;
    const x = player.x + (player.role === 'defender' ? stride : player.role === 'receiver' && this.sceneId === 'first-touch-exit' ? stride * 0.5 : 0);
    const z = player.z;
    const ground = this.project(x, z);
    const scale = ground.scale;
    const angle = player.angle;
    const forward = { x: Math.sin(angle), z: -Math.cos(angle) };
    const side = { x: Math.cos(angle), z: Math.sin(angle) };
    const point = (sideOffset: number, forwardOffset: number, height: number): Point2D =>
      this.project(x + side.x * sideOffset + forward.x * forwardOffset, z + side.z * sideOffset + forward.z * forwardOffset, height);

    ctx.save();
    ctx.fillStyle = 'rgba(2, 18, 16, .34)';
    ctx.beginPath();
    ctx.ellipse(ground.x, ground.y + 2, 22 * scale, 8 * scale, -0.12, 0, Math.PI * 2);
    ctx.fill();

    const hip = point(0, 0, 0.58);
    const kneeLeft = point(-0.13 + stride, 0, 0.3);
    const kneeRight = point(0.13 - stride, 0, 0.3);
    const footLeft = point(-0.17 - stride, 0.12, 0.04);
    const footRight = point(0.17 + stride, 0.12, 0.04);
    this.drawLimb(ctx, hip, kneeLeft, '#17262c', 8 * scale);
    this.drawLimb(ctx, kneeLeft, footLeft, '#eef4eb', 6 * scale);
    this.drawLimb(ctx, hip, kneeRight, '#17262c', 8 * scale);
    this.drawLimb(ctx, kneeRight, footRight, '#eef4eb', 6 * scale);
    const bootLeft = point(-0.17 - stride, 0.22, 0.035);
    const bootRight = point(0.17 + stride, 0.22, 0.035);
    this.drawLimb(ctx, footLeft, bootLeft, '#17262c', 6 * scale);
    this.drawLimb(ctx, footRight, bootRight, '#17262c', 6 * scale);

    const shoulderLeft = point(-0.25, 0, 1.2);
    const shoulderRight = point(0.25, 0, 1.2);
    const armLeft = point(-0.38, 0.01, 0.77);
    const armRight = point(0.38, 0.01, 0.77);
    this.drawLimb(ctx, shoulderLeft, armLeft, player.color, 8 * scale);
    this.drawLimb(ctx, shoulderRight, armRight, player.color, 8 * scale);

    const frontLeft = point(-0.25, 0.18, 0.55);
    const frontRight = point(0.25, 0.18, 0.55);
    const topLeft = point(-0.25, 0.13, 1.25);
    const topRight = point(0.25, 0.13, 1.25);
    const backLeft = point(-0.25, -0.16, 0.58);
    const backRight = point(0.25, -0.16, 0.58);
    const backTopLeft = point(-0.25, -0.13, 1.22);
    const backTopRight = point(0.25, -0.13, 1.22);

    ctx.beginPath();
    ctx.moveTo(backTopLeft.x, backTopLeft.y);
    ctx.lineTo(backTopRight.x, backTopRight.y);
    ctx.lineTo(topRight.x, topRight.y);
    ctx.lineTo(topLeft.x, topLeft.y);
    ctx.closePath();
    ctx.fillStyle = this.shade(player.color, -25);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(topLeft.x, topLeft.y);
    ctx.lineTo(topRight.x, topRight.y);
    ctx.lineTo(frontRight.x, frontRight.y);
    ctx.lineTo(frontLeft.x, frontLeft.y);
    ctx.closePath();
    const shirt = ctx.createLinearGradient(topLeft.x, topLeft.y, frontLeft.x, frontLeft.y);
    shirt.addColorStop(0, this.shade(player.color, 24));
    shirt.addColorStop(1, this.shade(player.color, -10));
    ctx.fillStyle = shirt;
    ctx.strokeStyle = player.trim;
    ctx.lineWidth = 1.3 * scale;
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(backLeft.x, backLeft.y);
    ctx.lineTo(backRight.x, backRight.y);
    ctx.lineTo(frontRight.x, frontRight.y);
    ctx.lineTo(frontLeft.x, frontLeft.y);
    ctx.fillStyle = this.shade(player.color, -38);
    ctx.fill();

    const head = this.project(x + forward.x * 0.1, z + forward.z * 0.1, 1.48);
    const headRadius = 10.4 * scale;
    const skin = ctx.createRadialGradient(head.x - headRadius * 0.34, head.y - headRadius * 0.4, 1, head.x, head.y, headRadius * 1.2);
    skin.addColorStop(0, '#f6c8a3');
    skin.addColorStop(1, '#a96649');
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.ellipse(head.x, head.y, headRadius * 0.84, headRadius, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#202a2d';
    ctx.beginPath();
    ctx.ellipse(head.x - 1, head.y - headRadius * 0.68, headRadius * 0.8, headRadius * 0.42, -0.1, Math.PI, Math.PI * 2);
    ctx.fill();

    const chest = this.project(x, z, 0.94);
    ctx.save();
    ctx.font = `900 ${11 * scale}px Inter, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 2.5 * scale;
    ctx.strokeStyle = player.role === 'receiver' ? '#594600' : '#123552';
    ctx.strokeText(player.number, chest.x, chest.y);
    ctx.fillStyle = '#fff';
    ctx.fillText(player.number, chest.x, chest.y);
    ctx.restore();

    if (player.role === 'defender') this.drawPressureRing(ctx, x, z, scale, phase);
    ctx.restore();
  }

  private drawLimb(ctx: CanvasRenderingContext2D, start: Point2D, end: Point2D, color: string, width: number): void {
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  private drawPressureRing(ctx: CanvasRenderingContext2D, x: number, z: number, scale: number, phase: number): void {
    const center = this.project(x, z);
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 116, 139, .55)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 6]);
    ctx.beginPath();
    ctx.ellipse(center.x, center.y + 3, (28 + Math.sin(phase * Math.PI * 2) * 2) * scale, 11 * scale, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  private drawMovementHints(ctx: CanvasRenderingContext2D, phase: number): void {
    const from = this.project(-3.8, 0.85, 0.02);
    const receive = this.project(0, 0, 0.02);
    const freedom = this.project(3.4, -2.5, 0.02);
    const pressure = this.project(1.45, 1.15, 0.02);
    const selected = this.selectedChoiceId;
    ctx.save();
    ctx.lineWidth = 3.5;
    ctx.setLineDash([8, 8]);
    this.drawRoute(ctx, from, receive, '#f1f8f5', 0.66, true);
    if (this.sceneId === 'first-touch-exit') {
      this.drawRoute(ctx, receive, freedom, '#69f0ae', selected === 'space' || !selected ? 0.95 : 0.25, selected === 'space' || !selected);
      this.drawRoute(ctx, receive, pressure, '#ff8196', selected === 'pressure' ? 0.95 : 0.25, selected === 'pressure');
      this.drawRoute(ctx, receive, this.project(0.25, 0.08, 0.02), '#ffd761', selected === 'stop' ? 0.95 : 0.25, selected === 'stop');
    }
    ctx.setLineDash([]);
    ctx.restore();
  }

  private drawRoute(ctx: CanvasRenderingContext2D, start: Point2D, end: Point2D, color: string, alpha: number, emphasize: boolean): void {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = emphasize ? 4.5 : 2.5;
    ctx.shadowColor = color;
    ctx.shadowBlur = emphasize ? 10 : 0;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    const controlX = (start.x + end.x) / 2 + (end.y - start.y) * 0.14;
    const controlY = (start.y + end.y) / 2 - (end.x - start.x) * 0.08;
    ctx.quadraticCurveTo(controlX, controlY, end.x, end.y);
    ctx.stroke();
    const angle = Math.atan2(end.y - controlY, end.x - controlX);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(end.x - Math.cos(angle - 0.48) * 12, end.y - Math.sin(angle - 0.48) * 12);
    ctx.lineTo(end.x - Math.cos(angle + 0.48) * 12, end.y - Math.sin(angle + 0.48) * 12);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private drawBall(ctx: CanvasRenderingContext2D, phase: number): void {
    let x = -2.1;
    let z = 0.55;
    let height = 0.12;
    if (this.sceneId === 'scan-before-receive') {
      const passProgress = Math.min(1, (this.elapsedMs % 6000) / 2600);
      const eased = passProgress * passProgress * (3 - 2 * passProgress);
      x = -2.1 + eased * 2.0;
      z = 0.55 - eased * 0.55;
      height = 0.12 + Math.sin(eased * Math.PI) * 0.36;
    } else if (this.selectedChoiceId && this.elapsedMs > 350) {
      const progress = Math.min(1, (this.elapsedMs - 350) / 1650);
      const eased = progress * progress * (3 - 2 * progress);
      const target = this.choiceTarget(this.selectedChoiceId);
      x = target.x * eased;
      z = target.z * eased;
      height = 0.12 + Math.sin(progress * Math.PI) * (this.selectedChoiceId === 'space' ? 0.22 : 0.08);
    }

    const shadow = this.project(x, z, 0.025);
    const ball = this.project(x, z, height);
    const radius = 9 * ball.scale;
    ctx.save();
    ctx.fillStyle = 'rgba(1, 15, 14, .42)';
    ctx.beginPath();
    ctx.ellipse(shadow.x, shadow.y + 3, 10 * shadow.scale, 4.5 * shadow.scale, 0, 0, Math.PI * 2);
    ctx.fill();
    const sphere = ctx.createRadialGradient(ball.x - radius * 0.4, ball.y - radius * 0.5, 1, ball.x, ball.y, radius * 1.2);
    sphere.addColorStop(0, '#fff');
    sphere.addColorStop(0.72, '#e8edf0');
    sphere.addColorStop(1, '#9aa8ad');
    ctx.fillStyle = sphere;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(27, 40, 45, .76)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.fillStyle = '#26383d';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, radius * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawSceneCallout(ctx: CanvasRenderingContext2D, phase: number): void {
    const receiver = this.project(0, 0, 1.95);
    const defender = this.project(1.55, 1.15, 1.1);
    ctx.save();
    ctx.font = '800 13px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    if (this.sceneId === 'scan-before-receive') {
      const pulse = 0.76 + (Math.sin(phase * Math.PI * 2) + 1) * 0.11;
      this.drawLabel(ctx, 'ESCANEA', receiver.x - 18, receiver.y - 20, '#f6d968', pulse);
    } else {
      this.drawLabel(ctx, 'PRESIÓN', defender.x + 31, defender.y - 7, '#ff9bab', 0.92);
      const target = this.project(3.4, -2.5, 0.04);
      this.drawLabel(ctx, 'ESPACIO LIBRE', target.x + 5, target.y - 7, '#9cffce', 0.92);
    }
    ctx.restore();
  }

  private drawLabel(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, alpha: number): void {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = '900 12px Inter, Arial, sans-serif';
    const width = ctx.measureText(text).width + 18;
    ctx.fillStyle = 'rgba(3, 23, 22, .72)';
    ctx.beginPath();
    ctx.roundRect(x - width / 2, y - 15, width, 26, 13);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y - 2);
    ctx.restore();
  }

  private choiceTarget(choice: string): Point3D {
    if (choice === 'pressure') return { x: 1.45, z: 1.15 };
    if (choice === 'stop') return { x: 0.25, z: 0.08 };
    return { x: 3.4, z: -2.5 };
  }

  private shade(hex: string, amount: number): string {
    const value = hex.replace('#', '');
    const number = Number.parseInt(value, 16);
    const channels = [number >> 16, (number >> 8) & 0xff, number & 0xff].map((channel) =>
      Math.max(0, Math.min(255, channel + amount)),
    );
    return `rgb(${channels[0]}, ${channels[1]}, ${channels[2]})`;
  }
}
