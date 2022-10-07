#version 410

uniform float _time;
out vec4      out_Color;

// #include "_ROOT_FOLDER_/res/shader-lib/normalized_uv.glsl"
// #include "_COOL_RES_/shaders/math.glsl"

INPUT float    Scale;
INPUT Gradient gradient;

INPUT int   N;
INPUT float Circle_size;
INPUT float Shininess;
INPUT float Shininess2;

INPUT float Dissolve_speed;
INPUT float Runaway_speed;
INPUT float Shape;

void main()
{
    vec2 uv = normalized_uv() * Scale;
    vec3 color;

    float total_d = 0.;

    for (int i = 0; i < N; ++i)
    {
        vec2  rand   = hash_0_to_1_1D_to_2D(i);
        float angle  = rand.x * TAU;
        float radius = 0.;
        if (i != 0)
        {
            float time      = Dissolve_speed * _time;
            float should_go = rand.y * N;
            if (time > should_go)
            {
                radius += (time - should_go) * (time - should_go) * Runaway_speed;
            }
        }

        vec2 center = radius * vec2(cos(angle), sin(angle));

        float d = length(uv - center);
        total_d += 1. / pow(d, Shape);
    }

    float t = smoothstep(-Shininess, 0, total_d - Circle_size);
    t       = pow(t, Shininess2);

    color = gradient(t).rgb;

    out_Color = vec4(color, 1.);
}