/* Pattern s of twenty-ﬁrst century forest loss across a globalnetwork of important sites for biodiversity */

// Google Earth Engine link: https://code.earthengine.google.com/a950bf782e39bd665812e20dd190d6c6

/* INPUT:
IBA_collection - fusion table with a list of links to fusion tables containing 
                 Important Bird Areas (IBA) polygons.

We are working with a list of IBA (rather than a single one, which would make code simpler)
since at the moment of witing the script below Google Earth Engine and Fusion Tables were
not able to handle such large polygons at high resolution (scale of order of 30m).
*/
var IBA_collection = ee.FeatureCollection('ft:15rF8XpX24OYIJmPUD25F8ykQfsPEkntf7yuHs8_3'); 
var IBA_list = IBA_collection.toList(1e6).getInfo(); // make a list of all links 

/* Global Forest Change (GFC) map from Hansen et al. (2013)
   Can be replaced with updates version of GFC:
   - UMD/hansen/global_forest_change_2014
   - UMD/hansen/global_forest_change_2015 */
var gfcImage = ee.Image('UMD/hansen/global_forest_change_2013');

// GFC bands are explained here: 
// https://sites.google.com/site/earthengineapidocs/tutorials/global-forest-change-tutorial/reference-guide
var forest2000 = gfcImage.select('treecover2000').divide(100); // Forest cover in 2000 as a fraction
var areaImage2000 = forest2000.multiply(ee.Image.pixelArea()); // Forest cover area in 2000 in m^2
var lossImage = gfcImage.select('loss'); // select loss band
var lossYear = gfcImage.select('lossyear'); 
var gainImage = gfcImage.select('gain');
var totalLoss2012 = lossImage.multiply(ee.Image.pixelArea()); 

// Get all pixels from 2000 where loss occured. 
// If pixel had 70% forest cover in 2000 we assume that 70% was lost in 2012
var maskLossArea = forest2000.mask(lossImage).multiply(ee.Image.pixelArea());

// Most pessimistic approach - always assume 100% forest loss.
var lossImageArea = lossImage.multiply(ee.Image.pixelArea());

// Find gain-only pixels. Reasoning is that if both loss and gain occurs it's
// probably not suitable habitat
var gainOnly = gainImage.and(lossImage.not());
var gainOnlyArea = gainOnly.multiply(ee.Image.pixelArea());

/* We create an array in which we will store the following sequence:
- First element - Name, e.g. 'Tree area 2000'.
- Second element - Name of a band as it appears on GFC. Needed to retrieve results.
- Third element - The image itself. */
var areas = [];
areas.push(['Tree area 2000', 'treecover2000', areaImage2000]);
areas.push(['Forest loss 2001 - 2012', 'treecover2000', maskLossArea]);
areas.push(['Forest loss 2001 - 2012 pessimistic', 'loss', lossImageArea]);
areas.push(['Gain forest', 'gain', gainOnlyArea]);

for (var year = 1; year <= 12; year += 1)
{
  areas.push(['Loss area 200' + year.toString(), 
              'treecover2000',
              forest2000.mask(lossYear.eq(year)).multiply(ee.Image.pixelArea())]);
}

// 'Selectors' are a way of informing GEE which data we want exported. If none are specified 
// complete data set is exported, together with columns which are not relevant.
var selectors = [];
for (var idx = 0; idx < areas.length; idx += 1)
{
  selectors.push(areas[idx][0]);
}
selectors.push('OBJECTID_1', 'IntName', 'NatName', 'SitRecID');

var scale = 120; // Scale at which calculations should be run. GFC is 30m
var maxPixels = 1e12; // 10^12 - above that number of pixels GEE will use bestEffort flag
var bestEffort = false; // Change scale if too many pixels. Unlikely in this case.
var reducer = ee.Reducer.sum(); // This reducer will sum up all pixels

// For every fusion table with IBA ...
IBA_list.map(function f(IBA)
{
  // Get fusion table ID...
  var fusionTableID = 'ft:' + IBA.properties.table_id;
  // Get geometries from it...
  var collection = ee.FeatureCollection(fusionTableID, 'geometry');
  
  // For every such geometry...
  var areasComputeObject = collection.map(function f(e) { 
    // Go through each metric we pushed to the 'areas' array...
    for (var idx = 0; idx < areas.length; idx++)
    {
      e=e.set(areas[idx][0], // Name of the metric (e.g. Tree area 2000)
        ee.Number(areas[idx][2].reduceRegion({ // [2] is the image itself - perform 'reduce' on it
          reducer: reducer, // our reducer will sum all pixels
          scale: scale, // at this scale
          maxPixels: maxPixels,
          geometry : e.geometry(),
          bestEffort: bestEffort
        }).get(areas[idx][1])).divide(1e6)); // [1] is name from GFC. We divide by 1000^2 to get km^2
    }
    return e;
  });
  
  var filenamePrefix = 'IBA_' + IBA.properties.table_id;
  
  // We select subset of available columns. "false" indicate that geometry should not be exported.
  areasComputeObject = areasComputeObject.select(selectors, null, false);
  
  // "Export" will create an export task. No calculations are fired until one presses a button.
  // Since it is a loop a number of export tasks is created.
  var taskParams = { 'driveFolder' : '', 'fileFormat' : 'CSV' };
  Export.table(areasComputeObject, filenamePrefix, taskParams);

});
