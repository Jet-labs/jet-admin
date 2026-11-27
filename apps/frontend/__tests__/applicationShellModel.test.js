import {
  normalizeApplicationNavigationItem,
  normalizeApplicationShell,
} from "../src/presentation/components/applicationComponents/applicationShellModel";

describe("application shell model", () => {
  it("defaults a missing shell to the sidebar preset", () => {
    const shell = normalizeApplicationShell();
    expect(shell.kind).toBe("sidebar");
    expect(shell.appearance).toMatchObject({
      variant: "pills",
      size: "md",
      width: 220,
      collapsible: true,
      sticky: true,
    });
    expect(shell.navigation).toEqual([]);
  });

  it("normalizes the legacy header kind and fills appearance defaults", () => {
    const shell = normalizeApplicationShell({
      kind: "header",
      homeRouteID: "home",
      navigation: [{ routeID: "home", label: "Home" }],
    });
    expect(shell.kind).toBe("topbar");
    expect(shell.homeRouteID).toBe("home");
    expect(shell.appearance.variant).toBe("pills");
    expect(shell.appearance.width).toBe(220);
  });

  it("falls back to the app title for branding and preserves overrides", () => {
    expect(normalizeApplicationShell({}, "Orders").branding.title).toBe("Orders");
    const shell = normalizeApplicationShell(
      {
        kind: "hamburger",
        branding: { title: "Control room", subtitle: "Ops" },
        appearance: { variant: "minimal", width: 280 },
      },
      "Orders"
    );
    expect(shell.branding).toEqual({
      title: "Control room",
      subtitle: "Ops",
    });
    expect(shell.appearance.variant).toBe("minimal");
    expect(shell.appearance.width).toBe(280);
    expect(shell.appearance.showLabels).toBe(true);
  });

  it("normalizes navigation item defaults", () => {
    expect(
      normalizeApplicationNavigationItem({ routeID: "orders", label: "Orders" })
    ).toEqual({
      routeID: "orders",
      label: "Orders",
      icon: "dot",
      group: "",
      badge: "",
      hidden: false,
    });
  });
});
