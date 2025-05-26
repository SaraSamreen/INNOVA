import React, { useState } from 'react';
import "../../Styles/PricingH.css";
import Footer from "./Footer";

export default function PricingH() {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      title: 'Starter',
      monthly: '$9/mo',
      yearly: '$86/yr',
      features: ['AI Ad Generator', 'Logo Creator', 'Instagram Posting (5/mo)']
    },
    {
      title: 'Pro',
      monthly: '$19/mo',
      yearly: '$182/yr',
      features: ['Everything in Starter', 'Unlimited Posts', 'Premium Templates'],
      popular: true
    },
    {
      title: 'Business',
      monthly: '$39/mo',
      yearly: '$374/yr',
      features: ['Everything in Pro', 'Team Access', 'Priority Support']
    }
  ];

  return (
    <div className="pricing-container">
      <h2 className="pricing-heading">Choose Your Plan</h2>

      <div className="toggle-switch">
        <span className={!isYearly ? 'active' : ''}>Monthly</span>
        <label className="switch">
          <input type="checkbox" onChange={() => setIsYearly(!isYearly)} />
          <span className="slider"></span>
        </label>
        <span className={isYearly ? 'active' : ''}>Yearly</span>
      </div>

      <div className="cards-container1">
        {plans.map((plan, index) => (
          <div className={`card ${plan.popular ? 'popular' : ''}`} key={index}>
            {plan.popular && <div className="badge">Most Popular</div>}
            <h3>{plan.title}</h3>
            <p className="price">{isYearly ? plan.yearly : plan.monthly}</p>
            <ul>
              {plan.features.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
            <button className="btn">Subscribe</button>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
}
