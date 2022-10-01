#version 410

uniform float _time;
out vec4      out_Color;

// #include "_ROOT_FOLDER_/res/shader-lib/normalized_uv.glsl"
// #include "_COOL_RES_/shaders/math.glsl"

INPUT Gradient gradient;

INPUT float Scale;
INPUT float Random_amplitude;
INPUT float Random_seed;
INPUT float Slope;
INPUT float Offset;
INPUT float Shape;

INPUT float Cell_border;

void main()
{
    vec2 uv    = Scale * _uv;
    vec3 color = vec3(0.);

    // Gradient
    vec2 grid_uv = fract(uv) * 2. - 1.;
    vec2 grid_id = floor(uv) / Scale;
    // float x            = (1. - 2. * abs(grid_id.x - 0.5)) * Slope + Offset;
    float x            = (1. - pow(abs(2. * (grid_id.x - 0.5)), Shape)) * Slope + Offset;
    float rand         = hash_0_to_1_2D_to_1D(vec2(grid_id.x, Random_seed)) * 2. - 1.;
    float gradient_pos = -x + grid_id.y + floor(rand * Random_amplitude) / Scale;
    color              = gradient(gradient_pos).rgb;

    // Cell border
    if (max(abs(grid_uv.x), abs(grid_uv.y)) > 1. - Cell_border)
        color = vec3(0.);

    out_Color = vec4(color, 1.);
}