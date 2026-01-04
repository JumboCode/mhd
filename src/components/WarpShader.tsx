"use client";

import { useEffect, useRef } from "react";

interface WarpShaderProps {
    className?: string;
    colorBack?: { r: number; g: number; b: number; a: number };
    colorFront?: { r: number; g: number; b: number; a: number };
}

export default function WarpShader({
    className = "",
    colorBack = { r: 0, g: 0, b: 0, a: 1 },
    colorFront = { r: 1, g: 1, b: 1, a: 1 },
}: WarpShaderProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext("webgl2");
        if (!gl) {
            console.error("WebGL 2.0 not supported");
            return;
        }

        // Vertex Shader
        const vertexShaderSource = `#version 300 es
precision mediump float;
layout(location = 0) in vec4 a_position;
void main() { gl_Position = a_position; }`;

        // Fragment Shader
        const fragmentShaderSource = `#version 300 es
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform vec4 u_colorBack;
uniform vec4 u_colorFront;

out vec4 fragColor;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

const int bayer8x8[64] = int[64](
   0, 32,  8, 40,  2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44,  4, 36, 14, 46,  6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
   3, 35, 11, 43,  1, 33,  9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47,  7, 39, 13, 45,  5, 37,
  63, 31, 55, 23, 61, 29, 53, 21
);

float getBayerValue(vec2 uv) {
  ivec2 pos = ivec2(mod(uv, 8.0));
  int index = pos.y * 8 + pos.x;
  return float(bayer8x8[index]) / 64.0;
}

void main() {
  float t = .5 * u_time;
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;

  // Pixelization
  float pxSize = 1.00 * u_pixelRatio;
  vec2 pxSizeUv = gl_FragCoord.xy;
  pxSizeUv -= .5 * u_resolution;
  pxSizeUv /= pxSize;
  uv = floor(pxSizeUv) * pxSize / u_resolution.xy + .5 - .5;

  // Pattern UV
  float r = 0.00 * PI / 180.;
  mat2 rot = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 shape_uv = uv + vec2(0.00, 0.00);
  shape_uv *= u_resolution.xy / u_pixelRatio / 0.25;
  shape_uv = rot * shape_uv + .5;
  vec2 ditheringNoise_uv = uv * u_resolution;

  // Warp
  shape_uv *= 0.002;
  for (float i = 1.0; i < 10.0; i++) {
    shape_uv.x += 0.7 / i * cos(i * 2.5 * shape_uv.y + t);
    shape_uv.y += 0.7 / i * cos(i * 1.5 * shape_uv.x + t);
  }
  float shape = .3 / abs(sin(t - shape_uv.y - shape_uv.x));
  shape = smoothstep(0.45, 0.75, shape);

  float dithering = getBayerValue(pxSizeUv) - 0.5;
  float res = step(.5, shape + dithering);

  vec3 fgColor = u_colorFront.rgb * u_colorFront.a;
  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  vec3 color = fgColor * res + bgColor * (1. - u_colorFront.a * res);
  float opacity = u_colorFront.a * res + u_colorBack.a * (1. - u_colorFront.a * res);

  fragColor = vec4(color, opacity);
}`;

        // Compile shader
        function compileShader(
            gl: WebGL2RenderingContext,
            source: string,
            type: number,
        ): WebGLShader | null {
            const shader = gl.createShader(type);
            if (!shader) return null;

            gl.shaderSource(shader, source);
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error(
                    "Shader compilation error:",
                    gl.getShaderInfoLog(shader),
                );
                gl.deleteShader(shader);
                return null;
            }

            return shader;
        }

        // Create program
        const vertexShader = compileShader(
            gl,
            vertexShaderSource,
            gl.VERTEX_SHADER,
        );
        const fragmentShader = compileShader(
            gl,
            fragmentShaderSource,
            gl.FRAGMENT_SHADER,
        );

        if (!vertexShader || !fragmentShader) return;

        const program = gl.createProgram();
        if (!program) return;

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error(
                "Program linking error:",
                gl.getProgramInfoLog(program),
            );
            return;
        }

        // Set up geometry (full-screen quad)
        const positions = new Float32Array([
            -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
        ]);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

        // Get uniform locations
        const u_time = gl.getUniformLocation(program, "u_time");
        const u_resolution = gl.getUniformLocation(program, "u_resolution");
        const u_pixelRatio = gl.getUniformLocation(program, "u_pixelRatio");
        const u_colorBack = gl.getUniformLocation(program, "u_colorBack");
        const u_colorFront = gl.getUniformLocation(program, "u_colorFront");

        // Resize handler
        function resize() {
            if (!canvas || !gl) return;
            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvas.clientWidth * dpr;
            canvas.height = canvas.clientHeight * dpr;
            gl.viewport(0, 0, canvas.width, canvas.height);
        }

        resize();
        window.addEventListener("resize", resize);

        // Animation loop
        const startTime = Date.now();
        function render() {
            if (!canvas || !gl) return;

            const time = (Date.now() - startTime) / 1000;

            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.useProgram(program);
            gl.bindVertexArray(vao);

            gl.uniform1f(u_time, time);
            gl.uniform2f(u_resolution, canvas.width, canvas.height);
            gl.uniform1f(u_pixelRatio, window.devicePixelRatio || 1);
            gl.uniform4f(
                u_colorBack,
                colorBack.r,
                colorBack.g,
                colorBack.b,
                colorBack.a,
            );
            gl.uniform4f(
                u_colorFront,
                colorFront.r,
                colorFront.g,
                colorFront.b,
                colorFront.a,
            );

            gl.drawArrays(gl.TRIANGLES, 0, 6);

            animationFrameRef.current = requestAnimationFrame(render);
        }

        render();

        // Cleanup
        return () => {
            window.removeEventListener("resize", resize);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            gl.deleteProgram(program);
            gl.deleteShader(vertexShader);
            gl.deleteShader(fragmentShader);
            gl.deleteBuffer(positionBuffer);
            gl.deleteVertexArray(vao);
        };
    }, [colorBack, colorFront]);

    return (
        <canvas
            ref={canvasRef}
            className={className}
            style={{ width: "100%", height: "100%" }}
        />
    );
}
