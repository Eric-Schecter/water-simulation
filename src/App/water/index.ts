import { Application } from "../gl";
import { vec3, vec4, mat4 } from 'gl-matrix'
import { Texture } from '../gl/texture';
import { PlaneGeometry } from './planeGeometry';
import waveVS from './shader/wave.vs';
import waveFS from './shader/wave.fs';
import { Camera } from "./camera";
import { DirectionalLight } from "./directionallight";

export class Water extends Application {
  private vao!: WebGLVertexArrayObject;
  private camera: Camera;
  private wave: WebGLProgram;
  private timeLoc:WebGLUniformLocation = 0;
  private planeGeometry: PlaneGeometry;
  constructor(container: HTMLDivElement) {
    super(container);

    const { clientWidth, clientHeight } = this.canvas;
    const fov = 60 / 180 * Math.PI;
    const aspect = clientWidth / clientHeight;
    const near = 0.1;
    const far = 1000;
    this.camera = new Camera();
    this.camera.pos = vec3.fromValues(1, 1, -2);
    this.camera.setProjection(fov, aspect, near, far);
    this.camera.setView(vec3.fromValues(0, 0, 0));
    this.camera.setViewport(0, 0, clientWidth, clientHeight);

    this.planeGeometry = new PlaneGeometry(2,2, 100, 100);
    this.wave = this.programLoader.load(this.gl, waveVS, waveFS);
  }
  public setup = async () => {
    this.gl.useProgram(this.wave);

    const images = [
      { src: 'images/Water_001_SD/Water_001_DISP.png', name: 'u_displacementMap' },
      { src: 'images/Water_001_SD/Water_001_COLOR.jpg', name: 'u_colorMap' },
      { src: 'images/Water_001_SD/Water_001_NORM.jpg', name: 'u_normalMap' },
    ]
    const textures: Texture[] = [];

    await Promise.all(images.map(({ src, name }, index) => {
      const texture = new Texture(this.gl);
      textures[index] = texture;
      texture.location = this.gl.getUniformLocation(this.wave, name) as WebGLUniformLocation;
      return texture.load(src);
    }))
    textures.forEach((texture, index) => {
      this.gl.activeTexture(this.gl.TEXTURE0 + index);
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture.id);
      this.gl.uniform1i(texture.location, index);
    })

    const ratioLoc = this.gl.getUniformLocation(this.wave, 'u_ratio');
    this.gl.uniform1f(ratioLoc, 0.1);

    const projectionMatrixLoc = this.gl.getUniformLocation(this.wave, 'u_projectionMatrix');
    this.gl.uniformMatrix4fv(projectionMatrixLoc, false, this.camera.projection);

    const viewMatrixLoc = this.gl.getUniformLocation(this.wave, 'u_viewMatrix');
    this.gl.uniformMatrix4fv(viewMatrixLoc, false, this.camera.view);

    const modelMatrixLoc = this.gl.getUniformLocation(this.wave, 'u_modelMatrix');
    const modelMatrix = mat4.rotateX(mat4.create(), mat4.create(), -Math.PI / 2);
    this.gl.uniformMatrix4fv(modelMatrixLoc, false, modelMatrix);

    const lightPosLoc = this.gl.getUniformLocation(this.wave, 'u_lightPos');
    this.gl.uniform3fv(lightPosLoc, [10, 10, 10]);

    this.timeLoc = this.gl.getUniformLocation(this.wave, 'u_time') as WebGLUniformLocation;
    const directionLoc = this.gl.getUniformLocation(this.wave,'u_windDirection');
    this.gl.uniform2fv(directionLoc,[1,1]);

    const directionalLight = new DirectionalLight(  
      vec4.fromValues(1, 1, 1, 1),
      vec3.normalize(vec3.create(), vec3.fromValues(-1, -1, -1)),
      1
    );
    const directionalLightColorLoc = this.gl.getUniformLocation(this.wave,'u_directionalLight.color');
    this.gl.uniform4fv(directionalLightColorLoc,directionalLight.color);
    const directionalLightDirectionLoc = this.gl.getUniformLocation(this.wave,'u_directionalLight.direction');
    this.gl.uniform3fv(directionalLightDirectionLoc,directionalLight.direction);
    const directionalLightIntensityLoc = this.gl.getUniformLocation(this.wave,'u_directionalLight.intensity');
    this.gl.uniform1f(directionalLightIntensityLoc,directionalLight.intensity);

    const specularLoc = this.gl.getUniformLocation(this.wave,'u_specular');
    this.gl.uniform1f(specularLoc,1);

    const shininessLoc = this.gl.getUniformLocation(this.wave,'u_shininess');
    this.gl.uniform1f(shininessLoc,1);

    const cameraPosLoc = this.gl.getUniformLocation(this.wave,'u_cameraPos');
    this.gl.uniform3fv(cameraPosLoc,this.camera.pos);

    this.gl.useProgram(null);

    // init
    this.vao = this.gl.createVertexArray() as WebGLVertexArrayObject;
    const vbo = this.gl.createBuffer();
    const ibo = this.gl.createBuffer();
    // bind
    this.gl.bindVertexArray(this.vao);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);
    // pass data to buffer
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.planeGeometry.vertices), this.gl.STATIC_DRAW);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.planeGeometry.indices), this.gl.STATIC_DRAW);
    // bind buffer to variable in gpu
    this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 20, 0);
    this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, false, 20, 12);
    // enable varialbe
    this.gl.enableVertexAttribArray(0);
    this.gl.enableVertexAttribArray(1);
    // reset
    this.gl.bindVertexArray(null);
  }
  protected update = (time: number) => {
    const { clientWidth, clientHeight } = this.canvas;
    this.gl.viewport(0, 0, clientWidth, clientHeight);

    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.useProgram(this.wave);
    this.gl.bindVertexArray(this.vao);
    this.gl.uniform1f(this.timeLoc,time/100);
    this.gl.drawElements(this.gl.TRIANGLES, this.planeGeometry.indices.length, this.gl.UNSIGNED_SHORT, 0);
    this.gl.bindVertexArray(null);
    this.gl.useProgram(null);
  }
}