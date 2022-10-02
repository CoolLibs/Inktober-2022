#version 410

uniform float _time;
out vec4      out_Color;

// #include "_ROOT_FOLDER_/res/shader-lib/normalized_uv.glsl"
// #include "_COOL_RES_/shaders/math.glsl"

INPUT Gradient gradient;

INPUT float Scale;
INPUT vec2  Translation;

INPUT float Curve_size;
INPUT float Circle_radius;

INPUT int N;

INPUT float Time_offset;
INPUT float Size_decrease;
INPUT float Intensity;

INPUT int Lissajou_X;
INPUT int Lissajou_Y;

vec2 curve(float t)
{
    return Curve_size * vec2(
                            cos(Lissajou_X * t),
                            sin(Lissajou_Y * t)
                        );
}

void main()
{
    vec2 uv    = Scale * normalized_uv() + Translation;
    vec3 color = vec3(0.);

    float time   = _time;
    float radius = Circle_radius;

    float total_t = 0.;

    for (int i = 0; i < N; ++i)
    {
        time -= Time_offset;
        radius *= Size_decrease;
        vec2  point = curve(time);
        float d     = length(uv - point);
        float t     = Intensity * smoothstep(radius, radius * 0.98, d);
        total_t += t;
    }
    color     = gradient(total_t).rgb;
    out_Color = vec4(color, 1.);
}