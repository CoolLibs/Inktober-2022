#version 410

uniform float _time;
out vec4      out_Color;

// #include "_ROOT_FOLDER_/res/shader-lib/normalized_uv.glsl"

// camera
INPUT vec2  Translation;
INPUT float Scale;
// camera

INPUT RgbColor Background_col;
INPUT RgbColor Bubble_col;
INPUT RgbColor Highlight_col;

INPUT float Voronoi_irregularity;
INPUT float Voronoi_shape;
INPUT bool  Voronoi_keep_points_in_disk;

INPUT float Bubbles_spacing;

INPUT float Highlight_min;
INPUT float Highlight_max;
INPUT float Highlight_length;
INPUT float Highlight_shape;
// INPUT float Highlight_test;
// INPUT Angle Highlight_dir;

INPUT vec2  Inv_center;
INPUT float Inv_radius;

// #include "_COOL_RES_/shaders/math.glsl"

vec2 distribute_center_in_a_square(vec2 rand)
{
    vec2 p = sin(rand * 4.43 /* _time */) * Voronoi_irregularity * .5;
    return p;
}

vec2 distribute_center_in_a_circle(vec2 rand)
{
    vec2  p = 2. * distribute_center_in_a_square(rand);
    float l = length(p);
    if (l > 1)
        p = p / vec2(l);
    return p * 0.5;
}

vec2 get_cell_center_local(vec2 grid_id)
{
    vec2 rand = hash_0_to_1_2D_to_2D(grid_id);
    return Voronoi_keep_points_in_disk
               ? distribute_center_in_a_circle(rand)
               : distribute_center_in_a_square(rand);
}

struct CircleCoords {
    float radial;  /// 0 corresponds to the center of a circle and 1 to the end.
    float angular; /// Angle between 0 and TAU
};

CircleCoords circle_in_voronoi_cell(vec2 uv)
{
    vec2 grid_uv = fract(uv) - .5;
    vec2 grid_id = floor(uv);

    // Find the cell we are in
    float min_dist = FLT_MAX;
    vec2  cell_id  = vec2(0);
    for (int y = -1; y <= 1; y++)
    {
        for (int x = -1; x <= 1; x++)
        {
            vec2 offs                   = vec2(x, y);
            vec2 curr_cell_id           = grid_id + offs;
            vec2 curr_cell_center_world = curr_cell_id + get_cell_center_local(curr_cell_id);

            vec2  pos_in_cell = uv - curr_cell_center_world;
            float d           = pow(pow(abs(pos_in_cell.x), Voronoi_shape) + pow(abs(pos_in_cell.y), Voronoi_shape), 1 / Voronoi_shape);

            if (d < min_dist)
            {
                min_dist = d;
                cell_id  = curr_cell_id;
            }
        }
    }

    vec2 my_cell_center_world  = cell_id + get_cell_center_local(cell_id);
    vec2 uv_rel_to_cell_center = uv - my_cell_center_world;

    // Find the cell center that is closest to the center of the cell we are in

    float min_cell_dist = FLT_MAX;
    for (int y = -1; y <= 1; y++)
    {
        for (int x = -1; x <= 1; x++)
        {
            if (x == 0 && y == 0)
                continue;
            vec2 offs                   = vec2(x, y);
            vec2 curr_cell_id           = cell_id + offs;
            vec2 curr_cell_center_world = curr_cell_id + get_cell_center_local(curr_cell_id);

            vec2  pos_in_cell = curr_cell_center_world - my_cell_center_world;
            float d           = pow(pow(abs(pos_in_cell.x), Voronoi_shape) + pow(abs(pos_in_cell.y), Voronoi_shape), 1 / Voronoi_shape);

            if (d < min_cell_dist)
            {
                min_cell_dist = d;
            }
        }
    }

    // Return
    CircleCoords res;

    res.radial  = min_dist / (min_cell_dist * 0.5 * Bubbles_spacing);
    res.angular = atan(uv_rel_to_cell_center.y, uv_rel_to_cell_center.x);

    return res;
}

float is_highlight(CircleCoords coords)
{
    float Highlight_dir = _time * 2.5;
    float angular_pos   = fract((coords.angular - Highlight_dir) / TAU); // 0 to 1
    angular_pos         = abs(angular_pos - 0.5) * 2;                    // Map 0 to 1 and 1 to 1

    float thickness = smoothstep(
        pow(angular_pos, Highlight_shape),
        0,
        Highlight_length
    );

    float med           = (Highlight_min + Highlight_max) * 0.5;
    float highlight_min = mix(Highlight_min, med, thickness);
    float highlight_max = mix(Highlight_max, med, thickness);

    // float is_highlight = highlight_min < coords.radial && coords.radial < highlight_max ? 1. : 0.;
    float is_highlight = 1. - smoothstep(coords.radial, highlight_min, highlight_max);
    // is_highlight *= angular_pos;
    return is_highlight;
}

struct Circle {
    vec2  center;
    float radius;
};

vec2 circular_inversion(vec2 uv, Circle circle)
{
    vec2  rel    = uv - circle.center;
    float radius = length(rel);
    float angle  = atan(rel.y, rel.x);

    float new_radius = circle.radius * circle.radius / radius;
    return circle.center + new_radius * vec2(cos(angle), sin(angle));
}

void main()
{
    vec2 uv = Scale * normalized_uv() + Translation;
    // uv      = vec2(uv.y, -uv.x);
    uv = circular_inversion(uv, Circle(Inv_center, Inv_radius));

    CircleCoords circle_coords = circle_in_voronoi_cell(uv);
    float        pos_in_circle = circle_coords.radial;
    float        is_circle     = pos_in_circle < 1. ? 1. : 0.;

    vec3 color = mix(Background_col, Bubble_col, is_circle);
    color      = mix(color, Highlight_col, is_highlight(circle_coords));

    out_Color = vec4(color, 1.);
}