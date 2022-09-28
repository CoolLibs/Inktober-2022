#version 410

uniform float _time;
out vec4      out_Color;

// #include "_ROOT_FOLDER_/res/shader-lib/normalized_uv.glsl"
// #include "_ROOT_FOLDER_/res/shader-lib/classic_noise.glsl"

INPUT Gradient gradient;

INPUT vec2  Translation;
INPUT vec2  Scale;
INPUT float Zoom;

INPUT float Noise1_Frequency;
INPUT float Noise1_Fractalness;
INPUT float Noise1_Scale;

INPUT float Noise2_Frequency;
INPUT float Noise2_Fractalness;
INPUT float Noise2_Scale;

INPUT float Noise3_Frequency;
INPUT float Noise3_Fractalness;
INPUT float Noise3_Scale;

void main()
{
    vec2 uv = Zoom * Scale * normalized_uv() + Translation;

    float noise1 = classic_noise(uv, Noise1_Frequency, Noise1_Fractalness, Noise1_Scale);
    float noise2 = classic_noise(uv, Noise2_Frequency, Noise2_Fractalness, Noise2_Scale);
    float noise3 = classic_noise(uv, Noise3_Frequency, Noise3_Fractalness, Noise3_Scale);

    float chosen_noise;
    if (noise1 < noise2 && noise2 < noise3) chosen_noise = noise2; 
    if (noise1 < noise3 && noise3 < noise2) chosen_noise = noise3; 
    if (noise2 < noise1 && noise1 < noise3) chosen_noise = noise1; 
    if (noise2 < noise3 && noise3 < noise1) chosen_noise = noise3; 
    if (noise3 < noise1 && noise1 < noise2) chosen_noise = noise1; 
    if (noise3 < noise2 && noise2 < noise1) chosen_noise = noise1;

    float t = chosen_noise == noise1   ? 0.
              : chosen_noise == noise2 ? 0.5
                                       : 1.;

    vec3 color = gradient(t).rgb;
    out_Color = vec4(color, 1.);
}