#version 410

uniform float     _time;
out vec4          out_Color;
uniform sampler2D _image;
uniform sampler2D _texture;
vec3              image(vec2 uv)
{
    return texture(_texture, uv).rgb;
}
// #include "_ROOT_FOLDER_/res/shader-lib/normalized_uv.glsl"
// #include "_ROOT_FOLDER_/res/shader-lib/bichrome.glsl"

INPUT float    Scale;
INPUT RgbColor Background;
INPUT RgbColor Color;

INPUT float Shape;

INPUT float Antialiasing;

float luminance(vec3 color)
{
    vec3 channels_contribution = vec3(0.2126, 0.7152, 0.0722);
    return dot(color, channels_contribution);
}

void main()
{
    vec3 color;
    vec2 grid_uv    = fract(_uv * Scale) * 2. - 1.;
    vec2 eval_point = (floor(_uv * Scale) + 0.5) / Scale;

    float lum = luminance(image(eval_point));

    float radius = lum;
    float d      = pow(pow(abs(grid_uv.x), Shape) + pow(abs(grid_uv.y), Shape), 1. / Shape);
    color        = mix(Color, Background, smoothstep(radius - Antialiasing, radius + Antialiasing, d));

    out_Color = vec4(color, 1.);
}