Toyota AI Experience — 3D Models Directory
==========================================

Place each vehicle model in its own subfolder named after its ID:

  public/models/supra/scene.gltf
  public/models/rav4/scene.gltf
  public/models/yaris/scene.gltf
  public/models/corolla/scene.gltf
  public/models/camry/scene.gltf
  public/models/landcruiser/scene.gltf
  public/models/hilux/scene.gltf
  public/models/prius/scene.gltf
  public/models/chr/scene.gltf
  public/models/highlander/scene.gltf

The configurator tries paths in this order (first found wins):
  1. /models/[id]/scene.gltf   ← PRIMARY (subfolder — Sketchfab default export)
  2. /models/[id].gltf         ← SECONDARY (flat file)
  3. /models/[id].glb          ← TERTIARY (binary GLTF)

If all 3 paths fail (404), a detailed car silhouette is shown as fallback.

TEXTURE FILES
All referenced textures (.bin, .jpg, .png, .ktx2) must be in the same
folder as scene.gltf, or in a textures/ subfolder:

  public/models/supra/scene.bin
  public/models/supra/textures/diffuse.jpg
  public/models/supra/textures/normal.png
  ...

RECOMMENDED SOURCE
  Sketchfab.com — search "Toyota [model name]", filter "Downloadable"
  Export format: GLTF 2.0 (includes .gltf + .bin + textures/)

VEHICLE IDs (exact folder names required)
  supra, rav4, yaris, corolla, camry,
  landcruiser, hilux, prius, chr, highlander
