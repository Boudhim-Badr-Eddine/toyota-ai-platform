/** True for 3D configurator view — hide global nav for full-screen experience */
export function isImmersiveConfigurator(pathname: string): boolean {
  return /^\/configurator\/[^/]+/.test(pathname);
}
