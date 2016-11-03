#include <gst/gst.h>
#include "metadata.h"
#include "player.h"

NAN_MODULE_INIT(Init) {
  gst_init(NULL, NULL);

  Nan::Set(target,
      Nan::New<v8::String>("metadata").ToLocalChecked(),
      Nan::GetFunction(Nan::New<v8::FunctionTemplate>(Metadata)).ToLocalChecked());

  Player::Init(target);
}

NODE_MODULE(addon, Init)
