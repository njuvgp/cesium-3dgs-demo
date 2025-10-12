void gaussianSplatStage(inout vec4 color, in ProcessedAttributes attributes) {
    mediump float A = dot(v_vertPos, v_vertPos);
    if(A > 1.0)
        discard;
    mediump float scale = 4.0;
    mediump float B = exp(-A * scale) * (v_splatColor.a);
    color = vec4(v_splatColor.rgb * B, B);
    vec3 colorrgb = color.rgb;
    float alpha = color.a*1.25;
    alpha = min(alpha,1.0);
    /*colorrgb = czm_Tonemapping(colorrgb);*/
    /*colorrgb = colorrgb*1.5;*/
    /*colorrgb = pow( colorrgb, vec3(0.8,0.8,0.8) );*/
    color = vec4(colorrgb,alpha);
}

