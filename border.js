function Border (borderData)
{
    var vertexes = [];
    
    vertexes.push ([borderData.west, borderData.north]);
    vertexes.push ([borderData.east, borderData.north]);
    vertexes.push ([borderData.east, borderData.south]);
    vertexes.push ([borderData.west, borderData.south]);
    vertexes.push ([borderData.west, borderData.north]);
    
    this.data = { type: 'Polygon', coordinates: [vertexes] };
}

Border.encode = function (borderData)
{
    var border = new Border (borderData);
    
    return JSON.stringify (border.data);
};
