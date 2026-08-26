import Link from "next/link";
import Image from "next/image";

const plans = [
  {
    name: "Starter",
    badge: "Small PGs",
    price: "Rs 24,999/year",
    description: "For single-property PGs that want rooms, residents, and dues organized properly.",
    includes: ["Room and bed setup", "Tenant records", "Dues tracking", "Owner and warden access"],
    features: {
      "Property setup": true,
      "Rooms and tenants": true,
      "Dues and payments": true,
      "Gate passes": false,
      "Complaints and notices": false,
      "Parent access": false,
      "Multiple properties": false,
      "Custom workflows": false,
    },
  },
  {
    name: "Growth",
    badge: "Most popular",
    price: "Rs 39,999/year",
    description: "For active hostels with wardens, guards, payments, requests, and daily operations.",
    includes: ["Everything in Starter", "Gate pass and visitor flows", "Complaints and notices", "Guard and tenant access"],
    features: {
      "Property setup": true,
      "Rooms and tenants": true,
      "Dues and payments": true,
      "Gate passes": true,
      "Complaints and notices": true,
      "Parent access": "Optional",
      "Multiple properties": false,
      "Custom workflows": "Limited",
    },
  },
  {
    name: "Portfolio",
    badge: "Growing operators",
    price: "Rs 59,999/year",
    description: "For owners managing more than one PG, hostel, or co-living property.",
    includes: ["Everything in Growth", "Multi-property overview", "Role-based staff access", "Monthly operating reports"],
    features: {
      "Property setup": true,
      "Rooms and tenants": true,
      "Dues and payments": true,
      "Gate passes": true,
      "Complaints and notices": true,
      "Parent access": true,
      "Multiple properties": true,
      "Custom workflows": "Limited",
    },
  },
  {
    name: "Custom",
    badge: "Flexible scope",
    price: "Custom quote",
    description: "For institutes, large operators, or teams that need deeper customization.",
    includes: ["Custom modules", "Advanced workflows", "Special reports", "Dedicated onboarding plan"],
    features: {
      "Property setup": true,
      "Rooms and tenants": true,
      "Dues and payments": true,
      "Gate passes": true,
      "Complaints and notices": true,
      "Parent access": "Optional",
      "Multiple properties": true,
      "Custom workflows": true,
    },
  },
] as const;

const comparisonRows = Object.keys(plans[0].features) as Array<keyof (typeof plans)[number]["features"]>;

function FeatureValue({ value }: { value: boolean | string }) {
  if (value === true) return <span className="hostinPlanFeature yes">Included</span>;
  if (value === false) return <span className="hostinPlanFeature no">Not included</span>;
  return <span className="hostinPlanFeature partial">{value}</span>;
}

export default function PlansPage() {
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
          <Link className="gradientButton" href="/#demo">Book free demo</Link>
        </div>
      </header>

      <section className="plansHero">
        <p className="sectionEyebrow">Hostin pricing</p>
        <h1>Choose the operating plan that fits your property.</h1>
        <p>Every plan includes guided setup by 1Forge, role-based access, and support to help your team move from registers and WhatsApp into one system.</p>
      </section>

      <section className="plansGrid" aria-label="Hostin pricing plans">
        {plans.map((plan, index) => (
          <article className={`pricingCard ${index === 1 ? "popular" : ""}`} key={plan.name}>
            <span>{plan.badge}</span>
            <small>{plan.name}</small>
            <h2>{plan.price}</h2>
            <p>{plan.description}</p>
            <ul className="hostinPlanIncludes">
              {plan.includes.map((item) => <li key={item}>✓ {item}</li>)}
            </ul>
            <Link className={index === 1 ? "gradientButton" : "outlineButton"} href="/#demo">Book free demo</Link>
          </article>
        ))}
      </section>

      <section className="plansCompare" aria-labelledby="hostin-plan-comparison">
        <div>
          <p className="sectionEyebrow">Compare plans</p>
          <h2 id="hostin-plan-comparison">See what each Hostin plan includes.</h2>
          <p>Use this to pick the closest fit. Optional and custom items are finalized after we understand your property setup.</p>
        </div>
        <div className="hostinCompareTableWrap">
          <table className="hostinCompareTable">
            <thead>
              <tr>
                <th scope="col">Feature</th>
                {plans.map((plan) => <th scope="col" key={plan.name}>{plan.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row}>
                  <th scope="row">{row}</th>
                  {plans.map((plan) => (
                    <td key={`${plan.name}-${row}`}><FeatureValue value={plan.features[row]} /></td>
                  ))}
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
