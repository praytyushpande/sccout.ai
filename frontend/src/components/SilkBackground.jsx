import React, { useRef, useEffect } from 'react';

const vertexShaderSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision highp float;
  uniform float u_time;
  uniform vec2 u_resolution;

  // Simplex-style noise helpers
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float aspect = u_resolution.x / u_resolution.y;
    uv.x *= aspect;

    float t = u_time * 0.15;

    // Layered silk waves
    float n1 = snoise(vec2(uv.x * 1.5 + t * 0.3, uv.y * 2.0 + t * 0.5)) * 0.5;
    float n2 = snoise(vec2(uv.x * 3.0 - t * 0.4, uv.y * 1.5 + t * 0.3)) * 0.25;
    float n3 = snoise(vec2(uv.x * 5.0 + t * 0.2, uv.y * 4.0 - t * 0.6)) * 0.125;
    float n4 = snoise(vec2(uv.x * 0.8 + t * 0.1, uv.y * 0.6 - t * 0.2)) * 0.6;

    float noise = n1 + n2 + n3 + n4;

    // Silk fold highlights
    float fold = sin(noise * 6.28318 + uv.y * 4.0 + t) * 0.5 + 0.5;
    fold = pow(fold, 1.5);

    // Color palette — dark indigo/purple theme
    vec3 darkBase    = vec3(0.02, 0.01, 0.06);   // near-black with purple tint
    vec3 deepIndigo  = vec3(0.12, 0.08, 0.28);   // deep indigo
    vec3 accentPurple = vec3(0.30, 0.18, 0.55);  // medium purple
    vec3 highlight   = vec3(0.39, 0.40, 0.95);   // bright indigo (#6366f1)

    // Compose silk color
    vec3 color = mix(darkBase, deepIndigo, fold * 0.7);
    color = mix(color, accentPurple, pow(fold, 2.5) * 0.4);
    color = mix(color, highlight, pow(fold, 5.0) * 0.2);

    // Subtle specular sheen
    float sheen = pow(fold, 8.0) * 0.15;
    color += sheen;

    // Vignette to darken edges
    vec2 vigUv = gl_FragCoord.xy / u_resolution.xy;
    float vignette = 1.0 - smoothstep(0.3, 1.2, length(vigUv - 0.5) * 1.4);
    color *= vignette;

    // Overall brightness control — keep it dark so text reads
    color *= 0.65;

    gl_FragColor = vec4(color, 1.0);
  }
`;

const SilkBackground = () => {
    const canvasRef = useRef(null);
    const animRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
        if (!gl) {
            console.warn('WebGL not supported, falling back to CSS background');
            return;
        }

        // Compile shader
        function createShader(type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('Shader error:', gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        }

        const vertShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
        const fragShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
        if (!vertShader || !fragShader) return;

        const program = gl.createProgram();
        gl.attachShader(program, vertShader);
        gl.attachShader(program, fragShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(program));
            return;
        }

        gl.useProgram(program);

        // Full-screen quad
        const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        const aPos = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        const uTime = gl.getUniformLocation(program, 'u_time');
        const uRes = gl.getUniformLocation(program, 'u_resolution');

        function resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5); // cap for performance
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            gl.viewport(0, 0, canvas.width, canvas.height);
        }

        resize();
        window.addEventListener('resize', resize);

        const startTime = performance.now();

        function render() {
            const elapsed = (performance.now() - startTime) / 1000;
            gl.uniform1f(uTime, elapsed);
            gl.uniform2f(uRes, canvas.width, canvas.height);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            animRef.current = requestAnimationFrame(render);
        }

        animRef.current = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('resize', resize);
            if (animRef.current) cancelAnimationFrame(animRef.current);
            gl.deleteProgram(program);
            gl.deleteShader(vertShader);
            gl.deleteShader(fragShader);
            gl.deleteBuffer(buffer);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: -1,
                pointerEvents: 'none'
            }}
        />
    );
};

export default SilkBackground;
