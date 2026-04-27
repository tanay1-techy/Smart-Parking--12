export const calculatePricingMultiplier = (slots, totalSlots, date = new Date()) => {
  const occupiedSlots = slots.filter(s => s.status !== 'available').length;
  const occupancyRate = occupiedSlots / totalSlots;
  
  let multiplier = 1.0;
  
  if (occupancyRate < 0.40) {
    multiplier -= 0.15;
  }
  
  const hours = date.getHours();
  const day = date.getDay();
  const isWeekday = day >= 1 && day <= 5;
  
  if (isWeekday) {
    if (hours >= 8 && hours < 10) {
      multiplier += 0.50;
    } else if (hours >= 17 && hours < 19) {
      multiplier += 0.30;
    }
  }

  return Math.max(0.5, Math.min(multiplier, 3.0));
};

export const calculatePrice = (baseRate, multiplier, durationHours, isAdvance, advanceFee) => {
  let price = durationHours * (baseRate * multiplier);
  if (isAdvance) price += advanceFee;
  return price;
};
