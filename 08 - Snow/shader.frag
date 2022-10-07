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

INPUT float Wave_frequency;
INPUT float Max_hex_size;
INPUT float Time_speed;
INPUT float Antialiasing;

// https://www.shadertoy.com/view/3sSGWt
float HexDist(vec2 p)
{
    p = abs(p);

    float c = dot(p, normalize(vec2(1, 1.73)));
    c       = max(c, p.x);

    return c;
}
vec4 HexCoords(vec2 uv)
{
    vec2 r = vec2(1, 1.73);
    vec2 h = r * .5;

    vec2 a = mod(uv, r) - h;
    vec2 b = mod(uv - h, r) - h;

    vec2 gv = dot(a, a) < dot(b, b) ? a : b;

    float x  = atan(gv.x, gv.y);
    float y  = .5 - HexDist(gv);
    vec2  id = uv - gv;
    return vec4(x, y, id.x, id.y);
}

void main()
{
    vec2 uv = normalized_uv() * Scale;
    vec3 color;

    vec4 hex    = HexCoords(uv);
    vec2 hex_uv = hex.xy;
    vec2 hex_id = hex.zw;

    float d = length(hex_id);

    float time = _time * Time_speed;
    float t    = (sin(d * Wave_frequency - time) * 0.5 + 0.5);

    float is_hex = smoothstep(Antialiasing, -Antialiasing, Max_hex_size * (1. - hex_uv.y) - t);

    color += mix(Background, Color, is_hex);

    out_Color = vec4(color, 1.);
}