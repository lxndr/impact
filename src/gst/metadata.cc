#include <gst/gst.h>
#include "metadata.h"

class MetadataWorker : public Nan::AsyncWorker {
public:
  MetadataWorker(Nan::Callback *callback, const Nan::Utf8String& path)
    : Nan::AsyncWorker(callback), fname(*path) {
  }

  void Execute () {
    GError* err = NULL;

    gchar* uri = gst_filename_to_uri(this->fname, &err);
    if (!uri || err) {
      this->SetErrorMessage(err->message);
      g_error_free(err);
      return;
    }

    this->pipeline = gst_pipeline_new("pipeline");

    this->uridecodebin = gst_element_factory_make("uridecodebin", NULL);
    g_object_set(this->uridecodebin, "uri", uri, NULL);
    g_signal_connect(this->uridecodebin, "pad-added", G_CALLBACK(&MetadataWorker::on_pad_added), this);
    gst_bin_add(GST_BIN(this->pipeline), this->uridecodebin);

    this->fakesink = gst_element_factory_make("fakesink", NULL);
    gst_bin_add(GST_BIN(this->pipeline), this->fakesink);

    gst_element_set_state(this->pipeline, GST_STATE_PAUSED);

    GstMessage* msg = gst_bus_timed_pop_filtered(GST_ELEMENT_BUS(this->pipeline), GST_CLOCK_TIME_NONE,
        (GstMessageType) (GST_MESSAGE_ASYNC_DONE | GST_MESSAGE_TAG | GST_MESSAGE_ERROR));

    if (GST_MESSAGE_TYPE(msg) == GST_MESSAGE_TAG) {
      gst_message_parse_tag(msg, &this->taglist);
    }

    if (GST_MESSAGE_TYPE (msg) == GST_MESSAGE_ERROR) {
      gst_message_parse_error(msg, &err, NULL);
      this->SetErrorMessage(err->message);
      g_error_free(err);
    }

    gst_element_set_state(this->pipeline, GST_STATE_NULL);
    gst_message_unref(msg);
    gst_object_unref(this->pipeline);
    g_free(uri);
  }

  void HandleOKCallback () {
    Nan::HandleScope scope;

    auto obj = Nan::New<v8::Object>();

    if (this->taglist) {
      auto n_tags = gst_tag_list_n_tags(this->taglist);

      for (gint i = 0; i < n_tags; i++) {
        auto tag = gst_tag_list_nth_tag_name(this->taglist, i);
        auto tagValue = Nan::New(tag).ToLocalChecked();

        if (strcmp(tag, GST_TAG_TRACK_NUMBER) == 0 ||
            strcmp(tag, GST_TAG_TRACK_COUNT) == 0) {
          guint track_number;
          if (gst_tag_list_get_uint(this->taglist, tag, &track_number)) {
            obj->Set(tagValue, Nan::New(track_number));
          }
        } else if (strcmp(tag, GST_TAG_TITLE) == 0 ||
                   strcmp(tag, GST_TAG_ALBUM) == 0) {
          const gchar* value = NULL;
          if (gst_tag_list_peek_string_index(this->taglist, tag, 0, &value) && value) {
            obj->Set(tagValue, Nan::New(value).ToLocalChecked());
          }
        } else {
          auto n_values = gst_tag_list_get_tag_size(this->taglist, tag);

          if (n_values > 0) {
            auto arr = Nan::New<v8::Array>();
            const gchar* value = NULL;

            for (guint j = 0; j < n_values; j++) {
              if (gst_tag_list_peek_string_index(this->taglist, tag, j, &value) && value) {
                arr->Set(arr->Length(), Nan::New(value).ToLocalChecked());
              }
            }

            obj->Set(tagValue, arr);
          }
        }
      }
    }

    v8::Local<v8::Value> argv[] = { Nan::Null(), obj };
    this->callback->Call(2, argv);
  }

private:
  const char* fname = NULL;
  GstElement* pipeline = NULL;
  GstElement* uridecodebin = NULL;
  GstElement* fakesink = NULL;
  GstTagList* taglist = NULL;

  static void on_pad_added(GstElement* element, GstPad* new_pad, MetadataWorker* self) {
    GstPad* sinkpad = gst_element_get_static_pad(self->fakesink, "sink");

    if (!gst_pad_is_linked(sinkpad)) {
      if (gst_pad_link(new_pad, sinkpad) != GST_PAD_LINK_OK) {
        g_error("Failed to link pads!");
      }
    }

    gst_object_unref(sinkpad);
  }
};

NAN_METHOD(Metadata) {
  if (!(info.Length() >= 1 && info[0]->IsString())) {
    Nan::ThrowTypeError("Argument 1 has to be of string type.");
    return;
  }

  Nan::Utf8String fname(info[0]->ToString());
  auto callback = new Nan::Callback(info[1].As<v8::Function>());
  Nan::AsyncQueueWorker(new MetadataWorker(callback, fname));
}
