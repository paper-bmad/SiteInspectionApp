import { addMonths } from 'date-fns';
import type { ProjectDetails, BlockTimeline } from '../types/project';

export function generateBlocksFromSummary(summary: NonNullable<ProjectDetails['summary']>): BlockTimeline[] {
  const blocks: BlockTimeline[] = [];
  let blockCounter = 65; // ASCII for 'A'

  // Add apartment block if it exists
  if (summary.numApartments > 0) {
    blocks.push({
      id: `block-${String.fromCharCode(blockCounter)}`,
      name: String.fromCharCode(blockCounter),
      type: 'ApartmentBlock',
      quantity: 1,
      startDate: new Date().toISOString().split('T')[0],
      substructureDate: addMonths(new Date(), 3).toISOString().split('T')[0],
      superstructureDate: addMonths(new Date(), 6).toISOString().split('T')[0],
      completionDate: addMonths(new Date(), 12).toISOString().split('T')[0],
      details: {
        numLevels: summary.numLevels,
        numUnits: summary.numApartments,
        commercialUnits: summary.numCommercialUnitsBlock
      }
    });
    blockCounter++;
  }

  // Add detached houses if they exist
  if (summary.numDetachedHouses > 0) {
    blocks.push({
      id: `block-${String.fromCharCode(blockCounter)}`,
      name: String.fromCharCode(blockCounter),
      type: 'DetachedHouses',
      quantity: summary.numDetachedHouses,
      startDate: new Date().toISOString().split('T')[0],
      substructureDate: addMonths(new Date(), 2).toISOString().split('T')[0],
      superstructureDate: addMonths(new Date(), 4).toISOString().split('T')[0],
      completionDate: addMonths(new Date(), 8).toISOString().split('T')[0]
    });
    blockCounter++;
  }

  // Add semi-detached houses if they exist
  if (summary.numSemiDetachedHouses > 0) {
    blocks.push({
      id: `block-${String.fromCharCode(blockCounter)}`,
      name: String.fromCharCode(blockCounter),
      type: 'SemiDetachedHouses',
      quantity: summary.numSemiDetachedHouses,
      startDate: new Date().toISOString().split('T')[0],
      substructureDate: addMonths(new Date(), 2).toISOString().split('T')[0],
      superstructureDate: addMonths(new Date(), 4).toISOString().split('T')[0],
      completionDate: addMonths(new Date(), 8).toISOString().split('T')[0]
    });
    blockCounter++;
  }

  // Add terraced houses if they exist
  if (summary.numTerracedHouses > 0) {
    blocks.push({
      id: `block-${String.fromCharCode(blockCounter)}`,
      name: String.fromCharCode(blockCounter),
      type: 'TerracedHouses',
      quantity: summary.numTerracedHouses,
      startDate: new Date().toISOString().split('T')[0],
      substructureDate: addMonths(new Date(), 2).toISOString().split('T')[0],
      superstructureDate: addMonths(new Date(), 4).toISOString().split('T')[0],
      completionDate: addMonths(new Date(), 8).toISOString().split('T')[0]
    });
    blockCounter++;
  }

  // Add commercial units if they exist (excluding those in apartment block)
  const standAloneCommercial = summary.numCommercialUnitsTotal - summary.numCommercialUnitsBlock;
  if (standAloneCommercial > 0) {
    blocks.push({
      id: `block-${String.fromCharCode(blockCounter)}`,
      name: String.fromCharCode(blockCounter),
      type: 'CommercialUnits',
      quantity: standAloneCommercial,
      startDate: new Date().toISOString().split('T')[0],
      substructureDate: addMonths(new Date(), 2).toISOString().split('T')[0],
      superstructureDate: addMonths(new Date(), 4).toISOString().split('T')[0],
      completionDate: addMonths(new Date(), 8).toISOString().split('T')[0]
    });
  }

  return blocks;
}