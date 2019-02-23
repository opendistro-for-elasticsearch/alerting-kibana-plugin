/*
 *   Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

export function canAppendWildcard(keyPressed) {
  // If it's not a letter, number or is something longer, reject it
  if (!keyPressed || !/[a-z0-9]/i.test(keyPressed) || keyPressed.length !== 1) {
    return false;
  }
  return true;
}

export function createReasonableWait(cb) {
  return setTimeout(cb, 100);
}

const MAX_NUMBER_OF_MATCHING_INDICES = 100;

export function filterSystemIndices(indices, isIncludingSystemIndices) {
  if (!indices) {
    return indices;
  }

  const acceptableIndices = isIncludingSystemIndices
    ? indices
    : // All system indices begin with a period.
      indices.filter(index => !index.label.startsWith('.'));

  return acceptableIndices.slice(0, MAX_NUMBER_OF_MATCHING_INDICES);
}

/**
 This utility is designed to do a couple of things:

 1) Take in list of indices and filter out system indices if necessary
 2) Return a `visible` list based on a priority order.

 We are passing in three separate lists because they each represent
 something slightly different.

 - `unfilteredAllIndices`
 This is the result of the initial `*` query and represents all known indices
 - `unfilteredPartialMatchedIndices`
 This is the result of searching against the query with an added `*`. This is only
 used when the query does not end in an `*` and represents potential matches in the UI
 - `unfilteredExactMatchedIndices
 This is the result of searching against a query that already ends in `*`.
 We call this `exact` matches because ES is telling us exactly what it matches
 */
export function getMatchedOptions(
  unfilteredAllIndices,
  unfilteredPartialMatchedIndices,
  unfilteredExactMatchedIndices,
  unfilteredAllAliases,
  unfilteredPartialMatchedAliases,
  unfilteredExactMatchedAliases,
  isIncludingSystemIndices
) {
  const allIndices = filterSystemIndices(unfilteredAllIndices, isIncludingSystemIndices);
  const partialMatchedIndices = filterSystemIndices(
    unfilteredPartialMatchedIndices,
    isIncludingSystemIndices
  );
  const exactMatchedIndices = filterSystemIndices(
    unfilteredExactMatchedIndices,
    isIncludingSystemIndices
  );
  const allAliases = filterSystemIndices(unfilteredAllAliases, isIncludingSystemIndices);
  const partialMatchedAliases = filterSystemIndices(
    unfilteredPartialMatchedAliases,
    isIncludingSystemIndices
  );
  const exactMatchedAliases = filterSystemIndices(
    unfilteredExactMatchedAliases,
    isIncludingSystemIndices
  );
  // We need to pick one to show in the UI and there is a priority here
  // 1) If there are exact matches, show those as the query is good to go
  // 2) If there are no exact matches, but there are partial matches,
  // show the partial matches
  // 3) If there are no exact or partial matches, just show all indices
  let visibleOptions = [];
  if (exactMatchedAliases.length || exactMatchedIndices.length) {
    visibleOptions = [
      { label: 'Aliases', options: exactMatchedAliases },
      { label: 'Indices', options: exactMatchedIndices },
    ];
    // visibleOptions = exactMatchedAliases.concat(exactMatchedIndices);
  } else if (partialMatchedAliases.length || partialMatchedIndices.length) {
    visibleOptions = [
      { label: 'Aliases', options: partialMatchedAliases },
      { label: 'Indices', options: partialMatchedIndices },
    ];
    // visibleOptions = partialMatchedAliases.concat(partialMatchedIndices);
  } else {
    visibleOptions = [
      { label: 'Aliases', options: allAliases },
      { label: 'Indices', options: allIndices },
    ];
    // visibleOptions = allAliases.concat(allIndices);
  }

  return {
    visibleOptions,
  };
}
