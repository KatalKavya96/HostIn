"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";

const extensions = [
  {
    id: "guard",
    name: "Guard",
    price: 500,
    icon: "ri-shield-user-line",
    accountNote: "Includes 2 guard accounts",
    description: "Gate pass approvals, visitor entry, check-in and check-out movement controls.",
  },
  {
    id: "mess",
    name: "Mess Manager",
    price: 200,
    icon: "ri-restaurant-2-line",
    accountNote: "Includes 2 mess manager accounts",
    description: "Mess menu publishing, meal updates, resident feedback, and weekly menu operations.",
  },
  {
    id: "vault",
    name: "Vault Management",
    price: 300,
    icon: "ri-folder-shield-2-line",
    accountNote: "Document storage and verification tools",
    description: "Document vault, student records, verification status, and controlled document access.",
  },
] as const;

const packages = [
  {
    name: "Basic",
    badge: "Starter choice",
    range: "10-40 beds",
    minBeds: 10,
    maxBeds: 40,
    rate: 179,
    extensionMode: "₹1,000 bundle",
    description: "For smaller PGs that want structured owner, warden, and tenant operations.",
    includes: ["Owner, warden, and tenant roles", "Rooms and tenant records", "Dues visibility", "Optional extension bundle"],
  },
  {
    name: "Plus",
    badge: "Best value",
    range: "40-100 beds",
    minBeds: 40,
    maxBeds: 100,
    rate: 149,
    extensionMode: "All included",
    description: "For growing properties where gate, mess, and document operations happen daily.",
    includes: ["Everything in Basic", "Guard extension included", "Mess extension included", "Vault extension included"],
  },
  {
    name: "Premium",
    badge: "Most scalable",
    range: "100-500 beds",
    minBeds: 100,
    maxBeds: 500,
    rate: 129,
    extensionMode: "All included",
    description: "For larger hostels that need full operating visibility across teams and residents.",
    includes: ["Full role workspace", "All extensions included", "Operational reports", "Priority setup support"],
  },
  {
    name: "Enterprise",
    badge: "Lowest per-bed rate",
    range: "500+ beds",
    minBeds: 500,
    maxBeds: Infinity,
    rate: 89,
    extensionMode: "All included",
    description: "For large institutions and operators managing high-capacity properties.",
    includes: ["Portfolio-ready operating model", "All extensions included", "Custom onboarding plan", "Commercial support"],
  },
] as const;

const pricingComparisonRows = [
  ["Bed range", "Any size", "10-40", "40-100", "100-500", "500+"],
  ["Base price", "₹199 / bed", "₹179 / bed", "₹149 / bed", "₹129 / bed", "₹89 / bed"],
  ["Owner role", true, true, true, true, true],
  ["Warden role", true, true, true, true, true],
  ["Tenant role", true, true, true, true, true],
  ["Best for", "Flexible builds", "Small PGs", "Growing hostels", "Large hostels", "Institutions"],
] as const;

const operationsComparisonRows = [
  ["Guard role", "₹500 add-on", "Bundle add-on", true, true, true],
  ["Mess manager role", "₹200 add-on", "Bundle add-on", true, true, true],
  ["Vault management", "₹300 add-on", "Bundle add-on", true, true, true],
  ["Gate pass workflow", "With Guard add-on", "With bundle", true, true, true],
  ["Mess menu workflow", "With Mess add-on", "With bundle", true, true, true],
  ["Document storage", "With Vault add-on", "With bundle", true, true, true],
  ["Included guard accounts", "2 with add-on", "2 with bundle", "2 included", "2 included", "2 included"],
  ["Included mess accounts", "2 with add-on", "2 with bundle", "2 included", "2 included", "2 included"],
] as const;

function money(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function valueBadge(value: boolean | string) {
  if (value === true) return <span className="hostinPlanFeature yes"><i aria-hidden="true" className="ri-check-line" />Included</span>;
  if (value === false) return <span className="hostinPlanFeature no"><i aria-hidden="true" className="ri-close-line" />Not included</span>;
  return <span className="hostinPlanFeature partial">{value}</span>;
}

function packageTotal(plan: (typeof packages)[number], beds: number, wantsExtensions: boolean) {
  const billableBeds = Math.max(beds, plan.minBeds);
  const extensionCost = plan.name === "Basic" && wantsExtensions ? 1000 : 0;
  return billableBeds * plan.rate + extensionCost;
}

function packageFit(plan: (typeof packages)[number], beds: number) {
  if (beds < plan.minBeds) return "nearby";
  if (beds <= plan.maxBeds) return "matched";
  return "outside";
}

export default function PlansPage() {
  const [beds, setBeds] = useState(60);
  const [activePackage, setActivePackage] = useState(1);
  const [selectedExtensions, setSelectedExtensions] = useState<Record<string, boolean>>({
    guard: true,
    mess: true,
    vault: true,
  });

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActivePackage((current) => (current + 1) % packages.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, []);

  const calculator = useMemo(() => {
    const selected = extensions.filter((extension) => selectedExtensions[extension.id]);
    const extensionTotal = selected.reduce((total, extension) => total + extension.price, 0);
    const customTotal = beds * 199 + extensionTotal;
    const wantsExtensions = selected.length > 0;
    const options = packages
      .map((plan) => ({
        plan,
        fit: packageFit(plan, beds),
        total: packageTotal(plan, beds, wantsExtensions),
      }))
      .filter((option) => option.fit !== "outside")
      .sort((a, b) => a.total - b.total);
    const recommended = options[0] ?? {
      plan: packages[packages.length - 1],
      fit: "matched",
      total: packageTotal(packages[packages.length - 1], beds, wantsExtensions),
    };
    const savings = customTotal - recommended.total;
    const customGst = customTotal * 0.18;
    const recommendedGst = recommended.total * 0.18;
    return {
      customGst,
      customGrandTotal: customTotal + customGst,
      customTotal,
      extensionTotal,
      recommended,
      recommendedGrandTotal: recommended.total + recommendedGst,
      recommendedGst,
      savings,
      selected,
    };
  }, [beds, selectedExtensions]);

  return (
    <main className="marketingPage plansPage">
      <header className="topbar marketingNav">
        <Link className="brand markBrand" href="/" aria-label="Hostin home"><Image src="/brand/hostin-mark.png" alt="" width={52} height={52} priority /></Link>
        <nav className="topnav" aria-label="Pricing navigation">
          <Link href="/#features">Features</Link>
          <Link href="/#roles">Who it helps</Link>
          <Link href="/#setup">Setup</Link>
          <Link className="activeNavLink" href="/pricing">Pricing</Link>
        </nav>
        <div className="navActions">
          <Link className="navDemo" href="/login#demo-accounts">Try demo</Link>
          <Link className="navLogin" href="/login">Log in</Link>
          <a className="gradientButton" href="#calculator">Calculate price</a>
        </div>
      </header>

      <section className="plansHero">
        <p className="sectionEyebrow">Hostin pricing</p>
        <h1>Pricing that scales with your beds.</h1>
        <p>Start with owner, warden, and tenant access. Add guard, mess, and vault workflows when your property needs deeper daily operations.</p>
        <div className="plansHeroActions">
          <a className="gradientButton" href="#calculator">Calculate price</a>
          <a className="outlineButton" href="#compare">Compare packages</a>
        </div>
      </section>

      <section className="pricingCarousel" aria-label="Hostin pricing plans">
        <div className="plansGrid" style={{ "--active-package": activePackage } as CSSProperties & { "--active-package": number }}>
        {packages.map((plan, index) => (
          <article className={`pricingCard ${index === activePackage ? "isActive" : ""} ${index === 1 ? "popular" : ""}`} key={plan.name}>
            <span>{plan.badge}</span>
            <small>{plan.range}</small>
            <h2>{plan.name}</h2>
            <strong>{money(plan.rate)} / bed / month</strong>
            <p>{plan.description}</p>
            <div className="packageExtensionMode">
              <i aria-hidden="true" className={index === 0 ? "ri-add-circle-line" : "ri-checkbox-circle-line"} />
              {plan.extensionMode}
            </div>
            <ul className="hostinPlanIncludes">
              {plan.includes.map((item) => <li key={item}><i aria-hidden="true" className="ri-check-line" />{item}</li>)}
            </ul>
            <a className={index === 1 ? "gradientButton" : "outlineButton"} href="#calculator">Estimate this plan</a>
          </article>
        ))}
        </div>
        <div className="pricingCarouselDots" aria-label="Pricing carousel controls">
          {packages.map((plan, index) => (
            <button
              aria-label={`Show ${plan.name} plan`}
              className={index === activePackage ? "active" : ""}
              key={plan.name}
              onClick={() => setActivePackage(index)}
              type="button"
            />
          ))}
        </div>
      </section>

      <section className="extensionSection" aria-labelledby="hostin-extensions">
        <div className="splitHeading">
          <div>
            <p className="sectionEyebrow">Operational extensions</p>
            <h2 id="hostin-extensions">Buy only the workflows your property needs.</h2>
          </div>
          <p>Extensions unlock the operational roles and workflows outside the standard owner, warden, and tenant workspace.</p>
        </div>
        <div className="extensionCards">
          {extensions.map((extension) => (
            <article key={extension.id}>
              <i aria-hidden="true" className={extension.icon} />
              <span>{extension.name}</span>
              <strong>{money(extension.price)} / month</strong>
              <p>{extension.description}</p>
              <small>{extension.accountNote}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="priceCalculator" id="calculator" aria-labelledby="price-calculator-title">
        <div className="calculatorCopy">
          <p className="sectionEyebrow">Custom price calculator</p>
          <h2 id="price-calculator-title">Build a custom estimate, then compare it with the best package.</h2>
          <p>The standard builder starts at ₹199 per bed with owner, warden, and tenant access. Add extensions only when you need those workflows.</p>
          <div className="standardPlanBox">
            <span>Standard builder includes</span>
            <p><i aria-hidden="true" className="ri-user-star-line" />Owner</p>
            <p><i aria-hidden="true" className="ri-user-settings-line" />Warden</p>
            <p><i aria-hidden="true" className="ri-home-heart-line" />Tenant</p>
          </div>
        </div>

        <div className="calculatorPanel">
          <label className="bedInput">
            <span>Number of beds</span>
            <input
              aria-label="Number of beds"
              min={1}
              onChange={(event) => setBeds(Math.max(1, Number(event.target.value) || 1))}
              type="number"
              value={beds}
            />
          </label>

          <div className="extensionChecklist" aria-label="Select extensions">
            {extensions.map((extension) => (
              <label key={extension.id}>
                <input
                  checked={selectedExtensions[extension.id]}
                  onChange={(event) => setSelectedExtensions((current) => ({ ...current, [extension.id]: event.target.checked }))}
                  type="checkbox"
                />
                <span>
                  <b>{extension.name}</b>
                  <small>{money(extension.price)} / month</small>
                </span>
              </label>
            ))}
          </div>

          <div className="estimateBreakdown" aria-live="polite">
            <div><span>Base standard price</span><strong>{money(beds * 199)}</strong></div>
            <div><span>Selected extensions</span><strong>{money(calculator.extensionTotal)}</strong></div>
            <div><span>Subtotal before GST</span><strong>{money(calculator.customTotal)}</strong></div>
            <div><span>GST at 18%</span><strong>{money(calculator.customGst)}</strong></div>
            <div className="payableRow"><span>Custom payable quote</span><strong>{money(calculator.customGrandTotal)} / month</strong></div>
          </div>

          <div className="recommendationCard">
            <span>Recommended package</span>
            <h3>{calculator.recommended.plan.name}</h3>
            <p>
              {calculator.recommended.fit === "nearby"
                ? `Closest package starts at ${calculator.recommended.plan.minBeds} beds.`
                : `${calculator.recommended.plan.range} at ${money(calculator.recommended.plan.rate)} per bed.`}
            </p>
            <strong>{money(calculator.recommendedGrandTotal)} / month</strong>
            <div className="quoteStrip">
              <b>Quote</b>
              <small>{money(calculator.recommended.total)} subtotal + {money(calculator.recommendedGst)} GST</small>
            </div>
            {calculator.savings > 0 ? (
              <small>{calculator.recommended.plan.name} saves {money(calculator.savings)} per month and {calculator.recommended.plan.name === "Basic" ? "can bundle all extensions." : "includes all extensions."}</small>
            ) : (
              <small>Your custom builder estimate is already optimized for this setup.</small>
            )}
          </div>
        </div>
      </section>

      <section className="plansCompare" id="compare" aria-labelledby="hostin-plan-comparison">
        <div>
          <p className="sectionEyebrow">Compare plans</p>
          <h2 id="hostin-plan-comparison">Compare without the clutter.</h2>
          <p>Pricing and access sit in one table. Operational workflows and account limits sit in the next one.</p>
        </div>
        <div className="hostinCompareTableWrap">
          <h3>Pricing and core access</h3>
          <table className="hostinCompareTable">
            <thead>
              <tr>
                <th scope="col">Feature</th>
                <th scope="col">Custom Builder</th>
                {packages.map((plan) => <th scope="col" key={plan.name}>{plan.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {pricingComparisonRows.map((row) => (
                <tr key={row[0]}>
                  <th scope="row">{row[0]}</th>
                  {row.slice(1).map((value, index) => <td key={`${row[0]}-${index}`}>{valueBadge(value)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="hostinCompareTableWrap">
          <h3>Extensions and workflows</h3>
          <table className="hostinCompareTable">
            <thead>
              <tr>
                <th scope="col">Feature</th>
                <th scope="col">Custom Builder</th>
                {packages.map((plan) => <th scope="col" key={plan.name}>{plan.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {operationsComparisonRows.map((row) => (
                <tr key={row[0]}>
                  <th scope="row">{row[0]}</th>
                  {row.slice(1).map((value, index) => <td key={`${row[0]}-${index}`}>{valueBadge(value)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="plansNote">
        <div><p className="sectionEyebrow">Need a closer look?</p><h2>See Hostin with your actual property workflow in mind.</h2></div>
        <div><Link className="outlineButton" href="/login#demo-accounts">Try every role</Link><Link className="gradientButton" href="/#demo">Book free demo</Link></div>
      </section>

      <footer className="marketingFooter">
        <Link className="brand markBrand footerMark" href="/" aria-label="Hostin home"><Image src="/brand/hostin-mark.png" alt="" width={52} height={52} /></Link>
        <p>A fully managed hostel and PG operating system by 1Forge.</p>
        <div><Link href="/">Home</Link><Link href="/pricing">Pricing</Link><Link href="/login#demo-accounts">Try demo</Link><Link href="/login">Log in</Link></div>
        <small>© {new Date().getFullYear()} 1Forge. Built for better hostel operations.</small>
      </footer>
    </main>
  );
}
