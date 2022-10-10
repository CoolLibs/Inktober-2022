#version 410

uniform float _time;
out vec4      out_Color;

// #include "_ROOT_FOLDER_/res/shader-lib/normalized_uv.glsl"
// #include "_COOL_RES_/shaders/math.glsl"

INPUT Gradient gradient;
INPUT RgbColor Background;

INPUT int   N;
INPUT int   Iter;
INPUT float Circle_size;
INPUT float Glow;
INPUT float Speed;
INPUT float Duration;

vec2 baseCurve(float t)
{
    // triangle
    // float h = sqrt(3) / 2; // equi trg
    float h = 0.5;
    if (t < 0.5)
    {
        t *= 2;
        return t * vec2(0.5, h);
    }
    else
    {
        t = t * 2 - 1;
        return (1 - t) * vec2(0.5, h) + t * vec2(1, 0);
    }
    // return vec2(t, 0.);
    // // circle
    // const float pi  = 3.141593;
    // float       agl = pi - t * pi;
    // return vec2(0.5, 0) + 0.5 * vec2(cos(agl), sin(agl));
    // parabola
    // return vec2(t, -(t-0.5)*(t-0.5)+0.25);
}

mat3 trans(float x, float y)
{
    mat3 m  = mat3(1.0);
    m[2][0] = x;
    m[2][1] = y;
    return m;
}

mat3 scale(float s)
{
    mat3 m  = mat3(s);
    m[2][2] = 1.0;
    return m;
}

mat3 scale(float sx, float sy)
{
    mat3 m  = mat3(1.0);
    m[0][0] = sx;
    m[1][1] = sy;
    return m;
}

mat3 sym()
{
    return mat3(
        0, 1, 0,
        1, 0, 0,
        0, 0, 1
    );
}

vec2 curve(float t)
{
    if (t >= 1.00)
        return vec2(1000.);
    vec2 pos;
    mat3 mat = mat3(1.0);

    for (int n = 0; n < Iter; ++n)
    {
        int id = int(floor(t * 4));
        t      = fract(t * 4);
        switch (id)
        {
        case 0:
            mat *= sym();
            break;
        case 1:
            mat *= trans(0, 0.5);
            break;
        case 2:
            mat *= trans(0.5, 0.5);
            break;
        case 3:
            mat *= trans(1, 0.5) * scale(-1, -1) * sym();
            break;
        }
        mat *= scale(0.5);
    }
    vec3 pos3 = mat * vec3(baseCurve(t), 1.0);
    pos       = pos3.xy / pos3.z;
    return pos;
}

float circle(vec2 uv, vec2 center)
{
    float d = distance(uv, center);

    return smoothstep(Glow, -Glow, d - Circle_size);
}

void main()
{
    vec2 uv    = _uv;
    vec3 color = Background;

    float time = _time / Duration;

    for (int i = 0; i < N; ++i)
    {
        float t         = time * i / float(N);
        vec2  center    = curve(t);
        float is_circle = circle(uv, center);
        if (is_circle > 0.5)
        {
            color = gradient(t).rgb;
            break;
        }
    }

    out_Color = vec4(color, 1.);
}