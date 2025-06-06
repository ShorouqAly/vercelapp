import React from 'react';
import SubscriptionPlans from '../components/pricing/SubscriptionPlans';

const SubscriptionsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Subscription Plans</h1>
      <SubscriptionPlans />
    </div>
  );
};

export default SubscriptionsPage;