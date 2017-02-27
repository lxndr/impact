#pragma once

#include <nan.h>
#include <gst/gst.h>
#include <gst/player/player.h>

class Player : public Nan::ObjectWrap {
public:
  static NAN_MODULE_INIT(Init);

private:
  explicit Player();
  ~Player();

  static inline Nan::Persistent<v8::Function> & constructor() {
    static Nan::Persistent<v8::Function> my_constructor;
    return my_constructor;
  }

  static NAN_METHOD(New);
  static NAN_METHOD(Play);
  static NAN_METHOD(Pause);
  static NAN_METHOD(Stop);
  static NAN_GETTER(UriGetter);
  static NAN_SETTER(UriSetter);
  static NAN_GETTER(DurationGetter);
  static NAN_GETTER(PositionGetter);
  static NAN_SETTER(PositionSetter);
  static NAN_GETTER(VolumeGetter);
  static NAN_SETTER(VolumeSetter);
  static NAN_GETTER(MuteGetter);
  static NAN_SETTER(MuteSetter);

  static NAN_GETTER(OnProgressGetter);
  static NAN_SETTER(OnProgressSetter);
  static NAN_GETTER(OnStateChangeGetter);
  static NAN_SETTER(OnStateChangeSetter);
  static NAN_GETTER(OnEndGetter);
  static NAN_SETTER(OnEndSetter);
  static NAN_GETTER(OnErrorGetter);
  static NAN_SETTER(OnErrorSetter);

  Nan::Callback OnProgressCallback;
  Nan::Callback OnStateChangeCallback;
  Nan::Callback OnEndCallback;
  Nan::Callback OnErrorCallback;

  static void position_updated_cb(GstPlayer* player, GstClockTime pos, Player* self);
  static void state_changed_cb(GstPlayer* player, GstPlayerState state, Player* self);
  static void end_of_stream_cb(GstPlayer *player, Player* self);
  static void error_cb (GstPlayer* player, GError* err, Player* self);

private:
  GstPlayer* player;
};
