const models = ["grsupra", "rav4", "corolla", "camry", "landcruiser", "tacoma", "prius", "c-hr", "highlander", "sienna", "corollacross"];

for (const m of models) {
  const r = await fetch(`https://www.toyota.com/${m}/`);
  const html = await r.text();
  const matches = [
    ...html.matchAll(
      /https:\/\/tmna\.aemassets\.toyota\.com\/is\/image\/toyota\/toyota\/jellies\/max\/[^"'\s]+\/1\.png[^"'\s]*/g,
    ),
  ].map((x) => x[0].replace(/&amp;/g, "&"));
  console.log(m, [...new Set(matches)]);
}
