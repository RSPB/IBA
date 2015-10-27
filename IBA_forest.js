// Quantification of forest loss in Important Bird Areas from Global Forest Change map

var IBA_collection = ee.FeatureCollection('ft:15rF8XpX24OYIJmPUD25F8ykQfsPEkntf7yuHs8_3');
var IBA_list = IBA_collection.toList(1e6).getInfo();

// Calculate forest extent

var gfcImage = ee.Image('UMD/hansen/global_forest_change_2013');

// Calculations of forest extent for all species in year 2000
var forest2000 = gfcImage.select('treecover2000').divide(100);
var areaImage2000 = forest2000.multiply(ee.Image.pixelArea());
var lossImage = gfcImage.select('loss');
var lossYear = gfcImage.select('lossyear'); 
var gainImage = gfcImage.select('gain');
var totalLoss2012 = lossImage.multiply(ee.Image.pixelArea());

var maskLossArea = forest2000.mask(lossImage).multiply(ee.Image.pixelArea());
var lossImageArea = lossImage.multiply(ee.Image.pixelArea());

var gainAndLoss = gainImage.and(lossImage);
var gainOnly = gainImage.and(gainAndLoss.not());
var gainOnlyArea = gainOnly.multiply(ee.Image.pixelArea());

// Get loss images for subsequent years
var lossYearArea2001 = forest2000.mask(lossYear.eq(1)).multiply(ee.Image.pixelArea());
var lossYearArea2002 = forest2000.mask(lossYear.eq(2)).multiply(ee.Image.pixelArea());
var lossYearArea2003 = forest2000.mask(lossYear.eq(3)).multiply(ee.Image.pixelArea());
var lossYearArea2004 = forest2000.mask(lossYear.eq(4)).multiply(ee.Image.pixelArea());
var lossYearArea2005 = forest2000.mask(lossYear.eq(5)).multiply(ee.Image.pixelArea()); 
var lossYearArea2006 = forest2000.mask(lossYear.eq(6)).multiply(ee.Image.pixelArea());
var lossYearArea2007 = forest2000.mask(lossYear.eq(7)).multiply(ee.Image.pixelArea());
var lossYearArea2008 = forest2000.mask(lossYear.eq(8)).multiply(ee.Image.pixelArea());
var lossYearArea2009 = forest2000.mask(lossYear.eq(9)).multiply(ee.Image.pixelArea());
var lossYearArea2010 = forest2000.mask(lossYear.eq(10)).multiply(ee.Image.pixelArea());
var lossYearArea2011 = forest2000.mask(lossYear.eq(11)).multiply(ee.Image.pixelArea());
var lossYearArea2012 = forest2000.mask(lossYear.eq(12)).multiply(ee.Image.pixelArea());

var scale = 100;
var maxPixels = 1e12;
var reducer = ee.Reducer.sum();

IBA_list.map(function f(IBA)
{
  var fusionTableID = 'ft:' + IBA.properties.table_id;
  var collection = ee.FeatureCollection(fusionTableID, 'geometry');
  
  var allAreas2000 = collection.map(function f(e) { 
    return e.set("Tree area 2000", 
      ee.Number(areaImage2000.reduceRegion({
        reducer: reducer,
        scale: scale,
        maxPixels: maxPixels,
        geometry : e.geometry()  
      }).get('treecover2000')).divide(1e6))
    .set("Forest loss 2001 - 2012", 
      ee.Number(maskLossArea.reduceRegion({
        reducer: reducer,
        scale: scale,
        maxPixels: maxPixels,
        geometry : e.geometry()  
      }).get('treecover2000')).divide(1e6))
    .set("Forest loss 2001 - 2012 pessimistic", 
      ee.Number(lossImageArea.reduceRegion({
        reducer: reducer,
        scale: scale,
        maxPixels: maxPixels,
        geometry : e.geometry()  
      }).get('loss')).divide(1e6))    
    .set("Loss 2001", 
      ee.Number(lossYearArea2001.reduceRegion({
        reducer: reducer,
        scale: scale,
        maxPixels: maxPixels,
        geometry : e.geometry()  
      }).get('treecover2000')).divide(1e6))
    .set("Loss 2002", 
      ee.Number(lossYearArea2002.reduceRegion({
        reducer: reducer,
        scale: scale,
        maxPixels: maxPixels,
        geometry : e.geometry()  
      }).get('treecover2000')).divide(1e6))
    .set("Loss 2003", 
      ee.Number(lossYearArea2003.reduceRegion({
        reducer: reducer,
        scale: scale,
        maxPixels: maxPixels,
        geometry : e.geometry()  
      }).get('treecover2000')).divide(1e6))
    .set("Loss 2004", 
      ee.Number(lossYearArea2004.reduceRegion({
        reducer: reducer,
        scale: scale,
        maxPixels: maxPixels,
        geometry : e.geometry()  
      }).get('treecover2000')).divide(1e6))
    .set("Loss 2005", 
      ee.Number(lossYearArea2005.reduceRegion({
        reducer: reducer,
        scale: scale,
        maxPixels: maxPixels,
        geometry : e.geometry()  
      }).get('treecover2000')).divide(1e6))
    .set("Loss 2006", 
      ee.Number(lossYearArea2006.reduceRegion({
        reducer: reducer,
        scale: scale,
        maxPixels: maxPixels,
        geometry : e.geometry()  
      }).get('treecover2000')).divide(1e6))
    .set("Loss 2007", 
      ee.Number(lossYearArea2007.reduceRegion({
        reducer: reducer,
        scale: scale,
        maxPixels: maxPixels,
        geometry : e.geometry()  
      }).get('treecover2000')).divide(1e6))
    .set("Loss 2008", 
      ee.Number(lossYearArea2008.reduceRegion({
        reducer: reducer,
        scale: scale,
        maxPixels: maxPixels,
        geometry : e.geometry()  
      }).get('treecover2000')).divide(1e6))
    .set("Loss 2009", 
      ee.Number(lossYearArea2009.reduceRegion({
        reducer: reducer,
        scale: scale,
        maxPixels: maxPixels,
        geometry : e.geometry()  
      }).get('treecover2000')).divide(1e6))
    .set("Loss 2010", 
      ee.Number(lossYearArea2010.reduceRegion({
        reducer: reducer,
        scale: scale,
        maxPixels: maxPixels,
        geometry : e.geometry()  
      }).get('treecover2000')).divide(1e6))
    .set("Loss 2011", 
      ee.Number(lossYearArea2011.reduceRegion({
        reducer: reducer,
        scale: scale,
        maxPixels: maxPixels,
        geometry : e.geometry()  
      }).get('treecover2000')).divide(1e6))
    .set("Loss 2012", 
      ee.Number(lossYearArea2012.reduceRegion({
        reducer: reducer,
        scale: scale,
        maxPixels: maxPixels,
        geometry : e.geometry()  
      }).get('treecover2000')).divide(1e6))
    .set("Gain forest", 
      ee.Number(gainOnlyArea.reduceRegion({
        reducer: reducer,
        scale: scale,
        maxPixels: maxPixels,
        geometry : e.geometry()  
      }).get('gain')).divide(1e6)); 
  });
  
  var filenamePrefix = 'IBA_' + IBA.properties.table_id;
  var selectors = "OBJECTID_1,IntName,NatName,SitRecID,Tree area 2000,Forest loss 2001 - 2012,Forest loss 2001 - 2012 pessimistic,Loss 2001,Loss 2002,Loss 2003,Loss 2004,Loss 2005,Loss 2006,Loss 2007,Loss 2008,Loss 2009,Loss 2010,Loss 2011,Loss 2012,Gain forest"; 

  allAreas2000 = allAreas2000.select(selectors.split(','), null, false);
  
  var taskParams = { 'driveFolder' : '', 'fileFormat' : 'CSV' };
  Export.table(allAreas2000, filenamePrefix, taskParams);

});
