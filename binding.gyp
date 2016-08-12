{
  "targets": [{
    "target_name": "gst",
    "cflags_cc!": ["-fno-rtti"],
    "sources": [
      "src/gst/addon.cc",
      "src/gst/metadata.cc"
    ],
    "libraries": [
      "<!@(pkg-config --libs gstreamer-1.0)"
    ],
    "include_dirs": [
      "<!(node -e \"require('nan')\")",
      "<!@(pkg-config --cflags-only-I gstreamer-1.0 | sed s/-I//g)"
    ]
  }]
}
