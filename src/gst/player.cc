#include "player.h"


NAN_MODULE_INIT(Player::Init)
{
  auto tpl = Nan::New<v8::FunctionTemplate>(New);
  tpl->SetClassName(Nan::New("Player").ToLocalChecked());
  tpl->InstanceTemplate()->SetInternalFieldCount(1);

  Nan::SetPrototypeMethod(tpl, "play", Play);
  Nan::SetPrototypeMethod(tpl, "pause", Pause);
  Nan::SetPrototypeMethod(tpl, "stop", Stop);

  Nan::SetAccessor(tpl->InstanceTemplate(),
    Nan::New("uri").ToLocalChecked(), UriGetter, UriSetter);
  Nan::SetAccessor(tpl->InstanceTemplate(),
    Nan::New("duration").ToLocalChecked(), DurationGetter);
  Nan::SetAccessor(tpl->InstanceTemplate(),
    Nan::New("position").ToLocalChecked(), PositionGetter, PositionSetter);
  Nan::SetAccessor(tpl->InstanceTemplate(),
    Nan::New("volume").ToLocalChecked(), VolumeGetter, VolumeSetter);
  Nan::SetAccessor(tpl->InstanceTemplate(),
    Nan::New("mute").ToLocalChecked(), MuteGetter, MuteSetter);

  Nan::SetAccessor(tpl->InstanceTemplate(),
    Nan::New("onprogress").ToLocalChecked(), OnProgressGetter, OnProgressSetter);
  Nan::SetAccessor(tpl->InstanceTemplate(),
    Nan::New("onstatechange").ToLocalChecked(), OnStateChangeGetter, OnStateChangeSetter);
  Nan::SetAccessor(tpl->InstanceTemplate(),
    Nan::New("onend").ToLocalChecked(), OnEndGetter, OnEndSetter);
  Nan::SetAccessor(tpl->InstanceTemplate(),
    Nan::New("onerror").ToLocalChecked(), OnErrorGetter, OnErrorSetter);

  constructor().Reset(Nan::GetFunction(tpl).ToLocalChecked());
  Nan::Set(target, Nan::New("Player").ToLocalChecked(),
    Nan::GetFunction(tpl).ToLocalChecked());
}


NAN_METHOD(Player::New)
{
  if (info.IsConstructCall()) {
    auto obj = new Player();
    obj->Wrap(info.This());
    info.GetReturnValue().Set(info.This());
  } else {
    Nan::ThrowTypeError("Called as plain function is not permitted");
  }
}


void Player::position_updated_cb(GstPlayer* player, GstClockTime pos, Player* self)
{
  if (self->OnProgressCallback.IsEmpty())
    return;

  v8::Local<v8::Value> argv[] = { Nan::New((double) pos / 1000000000.0) };
  self->OnProgressCallback.Call(1, argv);
}

void Player::state_changed_cb(GstPlayer* player, GstPlayerState state, Player* self) {
  if (self->OnStateChangeCallback.IsEmpty())
    return;

  const gchar *stateName = gst_player_state_get_name(state);
  v8::Local<v8::Value> argv[] = { Nan::New(stateName).ToLocalChecked() };
  self->OnStateChangeCallback.Call(1, argv);
}

void Player::end_of_stream_cb(GstPlayer *player, Player* self)
{
  if (self->OnEndCallback.IsEmpty())
    return;

  self->OnEndCallback.Call(0, 0);
}

void Player::error_cb (GstPlayer* player, GError* err, Player* self)
{
  if (self->OnErrorCallback.IsEmpty())
    return;

  v8::Local<v8::Value> argv[] = { Nan::Error(err->message) };
  self->OnErrorCallback.Call(1, argv);
}


Player::Player()
{
  player = gst_player_new(NULL, gst_player_g_main_context_signal_dispatcher_new(NULL));
  g_signal_connect(player, "position-updated", G_CALLBACK(position_updated_cb), this);
  g_signal_connect(player, "state-changed", G_CALLBACK(state_changed_cb), this);
  g_signal_connect(player, "end-of-stream", G_CALLBACK(end_of_stream_cb), this);
  g_signal_connect(player, "error", G_CALLBACK (error_cb), this);
}


Player::~Player()
{
  gst_player_stop(player);
  gst_object_unref(GST_OBJECT(player));
}


NAN_METHOD(Player::Play)
{
  auto self = Nan::ObjectWrap::Unwrap<Player>(info.Holder());
  gst_player_play(self->player);
}


NAN_METHOD(Player::Pause)
{
  auto self = Nan::ObjectWrap::Unwrap<Player>(info.Holder());
  gst_player_pause(self->player);
}


NAN_METHOD(Player::Stop)
{
  auto self = Nan::ObjectWrap::Unwrap<Player>(info.Holder());
  gst_player_stop(self->player);
}


NAN_GETTER(Player::UriGetter)
{
  auto self = Nan::ObjectWrap::Unwrap<Player>(info.Holder());

  gchar* str = gst_player_get_uri(self->player);

  if (str) {
    info.GetReturnValue().Set(Nan::New(str).ToLocalChecked());
    g_free(str);
  } else {
    info.GetReturnValue().Set(Nan::Null());
  }
}


NAN_SETTER(Player::UriSetter)
{
  auto self = Nan::ObjectWrap::Unwrap<Player>(info.Holder());

  Nan::Utf8String str(value->ToString());
  const gchar* cstr = *str;

  auto uri = gst_filename_to_uri(cstr, NULL);
  gst_player_set_uri(self->player, uri);
  g_free(uri);

  info.GetReturnValue().Set(Nan::True());
}


NAN_GETTER(Player::DurationGetter)
{
  auto self = Nan::ObjectWrap::Unwrap<Player>(info.Holder());

  auto val = gst_player_get_duration(self->player);
  auto ret = (double) val / 1000000000.0;

  info.GetReturnValue().Set(Nan::New(ret));
}


NAN_GETTER(Player::PositionGetter)
{
  auto self = Nan::ObjectWrap::Unwrap<Player>(info.Holder());

  auto val = gst_player_get_position(self->player);
  auto ret = (double) val / 1000000000.0;

  info.GetReturnValue().Set(Nan::New(ret));
}


NAN_SETTER(Player::PositionSetter)
{
  auto self = Nan::ObjectWrap::Unwrap<Player>(info.Holder());

  auto val = value->NumberValue();
  auto position = (GstClockTime) (val * 1000000000.0);
  gst_player_seek(self->player, position);

  info.GetReturnValue().Set(Nan::True());
}


NAN_GETTER(Player::VolumeGetter)
{
  auto self = Nan::ObjectWrap::Unwrap<Player>(info.Holder());
  auto val = gst_player_get_volume(self->player);
  info.GetReturnValue().Set(Nan::New(val));
}


NAN_SETTER(Player::VolumeSetter)
{
  auto self = Nan::ObjectWrap::Unwrap<Player>(info.Holder());
  gst_player_set_volume(self->player, value->NumberValue());
  info.GetReturnValue().Set(Nan::True());
}


NAN_GETTER(Player::MuteGetter)
{
  auto self = Nan::ObjectWrap::Unwrap<Player>(info.Holder());
  auto val = gst_player_get_mute(self->player);
  info.GetReturnValue().Set(Nan::New((bool) val));
}


NAN_SETTER(Player::MuteSetter)
{
  auto self = Nan::ObjectWrap::Unwrap<Player>(info.Holder());

  gboolean val = (gboolean) value->BooleanValue();
  gst_player_set_mute(self->player, val);

  info.GetReturnValue().Set(Nan::True());
}


NAN_GETTER(Player::OnProgressGetter)
{
  auto self = Nan::ObjectWrap::Unwrap<Player>(info.Holder());
  info.GetReturnValue().Set(self->OnProgressCallback.GetFunction());
}


NAN_SETTER(Player::OnProgressSetter)
{
  auto self = Nan::ObjectWrap::Unwrap<Player>(info.Holder());
  self->OnProgressCallback.Reset(value.As<v8::Function>());
  info.GetReturnValue().Set(Nan::True());
}


NAN_GETTER(Player::OnStateChangeGetter)
{
  auto self = Nan::ObjectWrap::Unwrap<Player>(info.Holder());
  info.GetReturnValue().Set(self->OnStateChangeCallback.GetFunction());
}


NAN_SETTER(Player::OnStateChangeSetter)
{
  auto self = Nan::ObjectWrap::Unwrap<Player>(info.Holder());
  self->OnStateChangeCallback.Reset(value.As<v8::Function>());
  info.GetReturnValue().Set(Nan::True());
}


NAN_GETTER(Player::OnEndGetter)
{
  auto self = Nan::ObjectWrap::Unwrap<Player>(info.Holder());
  info.GetReturnValue().Set(self->OnEndCallback.GetFunction());
}


NAN_SETTER(Player::OnEndSetter)
{
  auto self = Nan::ObjectWrap::Unwrap<Player>(info.Holder());
  self->OnEndCallback.Reset(value.As<v8::Function>());
  info.GetReturnValue().Set(Nan::True());
}


NAN_GETTER(Player::OnErrorGetter)
{
  auto self = Nan::ObjectWrap::Unwrap<Player>(info.Holder());
  info.GetReturnValue().Set(self->OnErrorCallback.GetFunction());
}


NAN_SETTER(Player::OnErrorSetter)
{
  auto self = Nan::ObjectWrap::Unwrap<Player>(info.Holder());
  self->OnErrorCallback.Reset(value.As<v8::Function>());
  info.GetReturnValue().Set(Nan::True());
}
