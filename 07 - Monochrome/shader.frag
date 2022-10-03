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
INPUT float    Scale_growth;
INPUT RgbColor Background;
INPUT RgbColor Color;

INPUT float Shape;

INPUT float Antialiasing;

float luminance(vec3 color)
{
    vec3 channels_contribution = vec3(0.2126, 0.7152, 0.0722);
    return dot(color, channels_contribution);
}

vec3 effect(vec2 uv, float scale)
{
    vec2 grid_uv    = fract(uv * scale) * 2. - 1.;
    vec2 eval_point = (floor(uv * scale) + 0.5) / scale;

    float lum = luminance(image(eval_point));

    float radius = lum;
    vec2  center = grid_uv;
    float d      = pow(pow(abs(grid_uv.x), Shape) + pow(abs(grid_uv.y), Shape), 1. / Shape);
    return mix(Color, Background, smoothstep(radius - Antialiasing, radius + Antialiasing, d));
}

void main()
{
    // clang-format off
    float quadrant_id;
    if (_uv.x < 0.5 && _uv.y < 0.5) quadrant_id = 2.;
    if (_uv.x > 0.5 && _uv.y < 0.5) quadrant_id = 3.;
    if (_uv.x > 0.5 && _uv.y > 0.5) quadrant_id = 1.;
    if (_uv.x < 0.5 && _uv.y > 0.5) quadrant_id = 0.;
    // clang-format on
    float scale = Scale * pow(Scale_growth, quadrant_id) / 4;
    vec3  color = effect(fract(_uv * 2.), scale);

    out_Color = vec4(color, 1.);
}