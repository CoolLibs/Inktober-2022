#version 410

uniform float _time;
out vec4      out_Color;

// #include "_ROOT_FOLDER_/res/shader-lib/normalized_uv.glsl"
// #include "_COOL_RES_/shaders/math.glsl"

INPUT Gradient gradient;

INPUT int   N;
INPUT float Radius;
INPUT float Speed;
INPUT float Min_speed;
INPUT float Max_speed;
INPUT float Intensity;

INPUT float Shape;

vec2 mirror_repeat(vec2 p)
{
    return 1. - 2. * (abs(mod(0.5 * p + 0.5, 2.) - 1.));
}

void main()
{
    vec2 uv = normalized_uv() * 2.;

    vec3 color = vec3(0.);

    float time = Speed * _time;

    float gradient_pos = 0.;

    for (int i = 0; i < N; ++i)
    {
        float t      = i / float(N);
        float angle  = t * TAU;
        t            = 1. - abs(2. * t - 1.);
        float radius = time * mix(Min_speed, Max_speed, t);
        vec2  center = radius * vec2(sin(angle), -cos(angle));
        center       = mirror_repeat(center);

        vec2  p         = uv - center;
        float d         = pow(pow(abs(p.x), Shape) + pow(abs(p.y), Shape), 1. / Shape);
        float is_circle = smoothstep(Radius, Radius - 0.01, d);

        gradient_pos += is_circle * Intensity;
    }

    color = gradient(gradient_pos).rgb;

    out_Color = vec4(color, 1.);
}