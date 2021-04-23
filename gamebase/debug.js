// Debug Module
GameBase.Debug = {};

// Variables
GameBase.Debug.ShowFPS = false;
GameBase.Debug.OverlaySize = 20;
GameBase.Debug.Vars = {};
GameBase.Debug.Vars.LastDrawCall = Date.now();
GameBase.Debug.Vars.LastSecond = Date.now();
GameBase.Debug.Vars.DrawCalls = 0;
GameBase.Debug.Vars.LastSecondDrawCalls = 0;
GameBase.Debug.Vars.Overlays = [];

GameBase.Debug.Draw = function() {
  this.Vars.DrawCalls++;
  if (this.ShowFPS) {
    this.DrawFPS();
  }
  this.DrawOverlays();
  this.Vars.LastDrawCall = Date.now();
  this.Vars.Overlays = [];
  if (this.Vars.LastSecond + 1000 <= Date.now()) {
    this.Vars.LastSecond = Date.now();
    this.Vars.LastSecondDrawCalls = this.Vars.DrawCalls;
    this.Vars.DrawCalls = 0;
  }
}

GameBase.Debug.DrawFPS = function() {
  const fps = 1/((Date.now() - this.Vars.LastDrawCall)/1000);
  const dps = this.Vars.LastSecondDrawCalls;
  const text = `${Math.floor(fps)}FPS (${dps}FPS)`;
  GameBase.Text.SetFont("Mplus1m Bold");
  GameBase.Text.SetSize(this.OverlaySize);
  const width = GameBase.Text.GetTextWidth(text);
  _r.color(0, 0, 0, 0.5);
  _r.rect(0, 0, width, this.OverlaySize);
  _r.color(0, 1, 0, 1);
  GameBase.Text.DrawText(0, 0, text);
}

GameBase.Debug.DrawOverlays = function() {
  const startY = (this.ShowFPS) ? this.OverlaySize + 1 : 0;
  GameBase.Text.SetFont("Mplus1m Bold");
  GameBase.Text.SetSize(this.OverlaySize);
  this.Vars.Overlays.forEach((overlay, i) => {
    const width = GameBase.Text.GetTextWidth(overlay.text);
    const y = startY + (this.OverlaySize+1)*i;
    _r.color(0, 0, 0, 0.5);
    _r.rect(0, y, width, this.OverlaySize);
    _r.color(...overlay.colour);
    GameBase.Text.DrawText(0, y, overlay.text);
  });
}

GameBase.Debug.AddOverlay = function(text, colour) {
  colour = colour || [0, 1, 0, 1];
  this.Vars.Overlays.push({ text, colour });
}

GameBase.Debug.AddTracker = function(name, type) {

}