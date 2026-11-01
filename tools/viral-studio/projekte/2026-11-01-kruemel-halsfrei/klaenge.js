// Die Effekte: jeder auf dem, was sich bewegt, in dem Bild, in dem es sich bewegt (siehe anleitung/klang.md).
import { v } from "#stimme";

const e = [];
const setze = (klang, t, o = {}) => e.push({ klang, t, ...o });

export default e;
