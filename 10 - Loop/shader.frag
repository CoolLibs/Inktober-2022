#version 410

uniform float _time;
out vec4      out_Color;

// #include "_ROOT_FOLDER_/res/shader-lib/normalized_uv.glsl"
// #include "_COOL_RES_/shaders/math.glsl"

INPUT float    Scale;
INPUT Gradient gradient;

INPUT int   N;
INPUT float Circles_offset;
INPUT float Lemniscate_size;
INPUT float Circle_size;
INPUT float Glow;

vec2 curve(float t)
{
    float c = cos(t);
    float s = sin(t);
    return Lemniscate_size * c / (1 + s * s) * vec2(1., s);
}

float circle(vec2 uv, vec2 center)
{
    float d = distance(uv, center);

    return smoothstep(Glow, -Glow, d - Circle_size);
}

void main()
{
    vec2 uv = normalized_uv() * Scale;
    vec3 color;

    float t         = _time;
    float is_circle = 0.;

    for (int i = 0; i < N; ++i)
    {
        vec2 center = curve(t);
        is_circle += circle(uv, center);
        t -= Circles_offset;
    }

    color = gradient(is_circle).rgb;

    out_Color = vec4(color, 1.);
}