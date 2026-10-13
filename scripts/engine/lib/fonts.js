// Each font file is registered as its own family (filename without extension); usage: ctx.font = '96px "Cinzel-700"'
window.FONT_FACES = [
  {family:'Cinzel-400', url:'lib/fonts/Cinzel-400.woff'},
  {family:'Cinzel-700', url:'lib/fonts/Cinzel-700.woff'},
  {family:'CormorantGaramond-500i', url:'lib/fonts/CormorantGaramond-500i.woff'},
  {family:'CormorantGaramond-500', url:'lib/fonts/CormorantGaramond-500.woff'},
  {family:'CormorantGaramond-700', url:'lib/fonts/CormorantGaramond-700.woff'},
  {family:'EBGaramond-400i', url:'lib/fonts/EBGaramond-400i.woff'},
  {family:'EBGaramond-400', url:'lib/fonts/EBGaramond-400.woff'},
  {family:'EBGaramond-600', url:'lib/fonts/EBGaramond-600.woff'},
  {family:'IMFellEnglish-400i', url:'lib/fonts/IMFellEnglish-400i.woff'},
  {family:'IMFellEnglish-400', url:'lib/fonts/IMFellEnglish-400.woff'},
  {family:'PlayfairDisplay-400i', url:'lib/fonts/PlayfairDisplay-400i.woff'},
  {family:'PlayfairDisplay-700i', url:'lib/fonts/PlayfairDisplay-700i.woff'},
  {family:'PlayfairDisplay-700', url:'lib/fonts/PlayfairDisplay-700.woff'},
  {family:'PressStart2P-400', url:'lib/fonts/PressStart2P-400.woff'},
  {family:'Poppins-600', url:'lib/fonts/Poppins-600.woff'},
  {family:'Poppins-700', url:'lib/fonts/Poppins-700.woff'},
  {family:'Poppins-800', url:'lib/fonts/Poppins-800.woff'},
  {family:'JosefinSans-700', url:'lib/fonts/JosefinSans-700.woff'},
  {family:'Bangers-400', url:'lib/fonts/Bangers-400.woff'},
  {family:'GochiHand-400', url:'lib/fonts/GochiHand-400.woff'},
  {family:'Caveat-600', url:'lib/fonts/Caveat-600.woff'},
  {family:'LilitaOne-400', url:'lib/fonts/LilitaOne-400.woff'},
  {family:'NotoSerifJP-600', url:'lib/fonts/NotoSerifJP-600.woff'},
  {family:'Exo2-800i', url:'lib/fonts/Exo2-800i.woff'},
  {family:'ArchivoBlack-400', url:'lib/fonts/ArchivoBlack-400.woff'},
  {family:'Kalam-700', url:'lib/fonts/Kalam-700.woff'},
  {family:'UnifrakturMaguntia-400', url:'lib/fonts/UnifrakturMaguntia-400.woff'},
  {family:'Marcellus-400', url:'lib/fonts/Marcellus-400.woff'},
  {family:'Righteous-400', url:'lib/fonts/Righteous-400.woff'},
  {family:'Anton-400', url:'lib/fonts/Anton-400.woff'},
  {family:'AlfaSlabOne-400', url:'lib/fonts/AlfaSlabOne-400.woff'},
  {family:'Rye-400', url:'lib/fonts/Rye-400.woff'},
  {family:'LibreBaskerville-400', url:'lib/fonts/LibreBaskerville-400.woff'},
  {family:'LibreBaskerville-700', url:'lib/fonts/LibreBaskerville-700.woff'},
  // CJK: LXGW WenKai Medium subset (OFL 1.1). All GB2312 characters + preset characters + characters used in the skill (font_subset.py --gb2312); add rare characters with scripts/font_subset.py --text; NotoSerifJP is a Japanese subset and lacks some simplified Chinese characters
  {family:'LXGWWenKai-500', url:'lib/fonts/LXGWWenKai-500.woff'},
  // ---- YouTube explainer grammars (references/09) ----
  // CJK sans: family names keep PuHui-* (97 references in code don't need changing); in the open-source version the files are GB2312 subsets of Source Han Sans / Noto Sans SC (OFL 1.1) in four weights 500/700/800/900
  // (scripts/font_subset.py --gb2312, about 1.4MB per weight). The author originally used Alibaba PuHuiTi 3.0, whose license doesn't allow redistribution after conversion or splitting, so it isn't shipped with the repository;
  // if you have PuHuiTi installed and want to switch back: generate PuHui-*.woff following font_subset.py's notes and change the urls in the four lines below back.
  {family:'PuHui-Medium', url:'lib/fonts/NotoSansSC-500.woff'},
  {family:'PuHui-Bold', url:'lib/fonts/NotoSansSC-700.woff'},
  {family:'PuHui-Heavy', url:'lib/fonts/NotoSansSC-800.woff'},
  {family:'PuHui-Black', url:'lib/fonts/NotoSansSC-900.woff'},
  // 3b1b formulas: CMU (LaTeX Computer Modern) roman/italic
  {family:'CMU-rm', url:'lib/fonts/cmunrm.woff'},
  {family:'CMU-it', url:'lib/fonts/cmunti.woff'},
  // Keynote Inter (the closest open-source font to SF Pro), finance Roboto Condensed: variable weight; choose the weight with '600 220px "Inter"'
  {family:'Inter', url:'lib/fonts/Inter-var.woff', desc:{weight:'100 900'}},
  {family:'RobotoCondensed', url:'lib/fonts/RobotoCondensed-var.woff', desc:{weight:'100 900'}},
  // Source Han Sans/Serif (variable weight): contain only the characters used by the three demo films 3b1b/keynote/finance (source files aren't shipped; for a new topic with missing characters use PuHui-*, or rebuild a subset from Google Fonts' NotoSansSC[wght].ttf)
  {family:'NotoSansSC', url:'lib/fonts/NotoSansSC-sub.woff', desc:{weight:'100 900'}},
  {family:'NotoSerifSC', url:'lib/fonts/NotoSerifSC-sub.woff', desc:{weight:'200 900'}},
];
