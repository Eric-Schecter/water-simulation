#version 300 es

precision mediump float;

struct DirectionalLight{
  vec4 color;
  vec3 direction;
  float intensity;
};

in vec2 v_uv;
in vec3 v_position;

uniform sampler2D u_colorMap;
uniform sampler2D u_normalMap;
uniform vec3 u_lightPos;
uniform DirectionalLight u_directionalLight;
uniform vec3 u_cameraPos;
uniform float u_shininess;
uniform float u_specular;

out vec4 fColor;

float calcDiffuseLight(vec3 normal,vec3 lightDir){
  return clamp(dot(-lightDir,normal),0.f,1.f);
}

float calcSpecularLight(vec3 viewDir,vec3 normal,vec3 lightDir){
  vec3 halfwayDir=normalize(-lightDir-viewDir);//Blinn-Phong
  return pow(max(dot(normal,halfwayDir),0.f),u_shininess);
}

vec4 calcColor(vec3 viewDir,vec3 normal,vec3 lightDir,vec4 color,float intensity){
  vec4 light=vec4(0.f);
  light+=calcDiffuseLight(normal,lightDir)*color;
  light+=calcSpecularLight(viewDir,normal,lightDir)*u_specular;
  return light*intensity;
}

vec4 calcDirectionalLight(vec3 viewDir,vec3 normal,DirectionalLight light){
  return calcColor(viewDir,normal,normalize(light.direction),light.color,light.intensity);
}

void main(){
  vec4 color=texture(u_colorMap,v_uv);
  vec3 viewDir=normalize(v_position-u_cameraPos);
  vec3 normal=normalize(texture(u_normalMap,v_uv).xyz);
  vec4 lightColor=calcDirectionalLight(viewDir,normal,u_directionalLight);
  
  fColor=color*lightColor;
}
