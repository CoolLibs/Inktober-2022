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
// #include "_COOL_RES_/shaders/noise3D.glsl"

INPUT float    Scale;
INPUT RgbColor Background;
INPUT RgbColor Firefly_color;
INPUT float    Gamma;
INPUT float    Firefly_pow;
INPUT float    Firefly_size;
INPUT int      N;
INPUT float    Correlation;
INPUT float    Max_oscillations;
INPUT float    Time_speed;

void main()
{
    vec2 uv = normalized_uv() * Scale;
    vec3 color;
    color = Background;

    for (int i = 0; i < N; ++i)
    {
        vec2 pos = vec2(
            Max_oscillations * snoise(vec3(Time_speed * _time, 0., i * Correlation)),
            Max_oscillations * snoise(vec3(Time_speed * _time, 1000., i * Correlation))
        );
        float t = 1. / pow(max(distance(pos, uv) + 1. - Firefly_size, 0.), Firefly_pow);
        color += t * Firefly_color;
    }

    color     = pow(color, vec3(Gamma));
    out_Color = vec4(color, 1.);
}