const hud = {
  drawHoleInfo(hole=0, par=0, shot=0) {
    _r.color(1, 1, 1, 1);
    _r.rect(0, _m.height-100, 570, 120, assets["hud_info_background.tex"]);
    _r.layer++;
    GameBase.Text.SetFont("HUD_Numbers");
    GameBase.Text.SetSize(48);
    GameBase.Text.DrawText(155, _m.height - 44, hole, 1, 1);
    GameBase.Text.DrawText(320, _m.height - 44, par, 1, 1);
    GameBase.Text.DrawText(500, _m.height - 44, shot, 1, 1);
  }
}

GameBase.Text.RegisterFont("HUD_Numbers", {
  Texture: assets["font_hud_numbers.tex"],
  TextureW: 250,
  TextureH: 48,
  CharW: 25,
  CharH: 48,
  Charset: "0123456789"
});