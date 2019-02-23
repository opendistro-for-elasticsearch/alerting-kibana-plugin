export const validateDestination = destinations => value => {
  if (!value) return 'Required';
  // In case existing destination doesn't exist in list , invalidate the field
  const destinationMatches = destinations.filter(destination => destination.value === value);
  if (destinationMatches.length === 0) {
    return 'Required';
  }
};
