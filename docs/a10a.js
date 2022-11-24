function a10a(){
    //Apply margin to svg
//Studied from Bhumika Srinivas' Starbucks Website example.
    const margin = {l: 80, r:80, t:200, b:100}
    const overall_width = 450
    const overall_height = 400
    const svg_name = "#a10a"
    let outerSvg = d3.select(svg_name)
        .append("svg")
        .attr("width", overall_width + margin.l + margin.r)
        .attr("height", overall_height + margin.t + margin.b);
//Background
    outerSvg.append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", "#faf5e6");
    let svg = outerSvg.append("g")
        .attr("transform", `translate(${margin.l}, ${margin.t})`);

    function main(svg) {

        //background
        let graph = svg.append("g").attr('class', 'graph');


        //Variables, minus margin to prevent out of bound bars
        //studied from: https://github.com/markumreed/data_science_for_everyone/blob/main/d3_project/bar_chart_csv/example.js
        const width = overall_width;
        const height = overall_height;

        const typeDomain = ["Rain", "Snow"];
        const typeRange = [
            "rgb(68,200,248)",
            "rgb(63,180,225)",
        ];

        //Config
        const url = "weather2.csv"
        const timeFormat = d3.utcFormat("%Y/%m/%d")
        const bubbleMax = 25;
        const legendLoc = [20, -100];

        //BAD config
        const precipitationMin = 10;
        const bubbleMin = 5;

        //Scale building/mapping and axis drawing studied from: https://github.com/markumreed/data_science_for_everyone/blob/main/d3_project/bar_chart_csv/example.js
        let scaleX = d3.scaleTime().range([0, width]);
        let scaleY = d3.scaleLinear().range([height, 0]);
        //GOOD
        let scaleV = d3.scaleLinear().range([bubbleMin, bubbleMax]);
        let axisX = d3.axisBottom(scaleX);
        let axisY = d3.axisLeft(scaleY);
        let colorScale = d3.scaleOrdinal().domain(typeDomain).range(typeRange);

        d3.csv(url).then( function(data) {

            //parse date
            let parse = d3.timeParse(timeFormat);
            data.forEach(function(d) {
                d["Date"] = parse(d["Date"]);
                if(parseFloat(d['PRCP']) > 0){
                    if(parseFloat(d['SNOW']) > 0){
                        d.type = typeDomain[1];
                    }
                    else{
                        d.type = typeDomain[0];
                    }
                }
                if(parseFloat(d['PRCP']) <= precipitationMin){
                    d['PRCP'] = precipitationMin.toString();
                }
            })

            console.log(data);

            //Map domain
            //X
            let minX = d3.min(data, function(d) {return d["Date"]});
            let maxX = d3.max(data, function(d) {return d["Date"]});
            maxX.setUTCDate(maxX.getUTCDate()+1);
            scaleX.domain([minX, maxX]);
            axisX.ticks(d3.timeMonth.every(2));

            //Y
            let minY = d3.min(data, function(d) {return parseFloat(d['TAVG'])});
            let maxY = d3.max(data, function(d) {return parseFloat(d['TAVG'])});
            minY = 5 * Math.floor(minY / 5);//Round up max value to nearest 5
            maxY = 5 * Math.ceil(maxY / 5);//Round up max value to nearest 5
            scaleY.domain([minY, maxY]);

            //V (PRCP)
            let minV = precipitationMin;
            let maxV = d3.max(data, function(d) {return parseFloat(d['PRCP'])});
            maxV = 10 * Math.ceil(maxV / 10);//Round up max value to nearest 5
            scaleV.domain([minV, maxV]);

            //Legend
            let legend1function = d3.legendSize()
                .scale(scaleV)
                .shape('circle')
                .shapePadding(35)
                .labelOffset(20)
                .orient('horizontal')
                .cellFilter(function(d){ return d.label !== '0.0'})
                .labels(labelHelper)
                .title("Precipitation");
            let legend2function = d3.legendColor()
                .shapeWidth(25)
                .labelFormat("d")
                .title("Precipitation Type")
                .shape("path", d3.symbol().type(d3.symbolCircle).size(150)())
                .scale(colorScale);

            let legend = svg.append('g')
                .attr("class", "legend")
                .attr("transform", `translate(${legendLoc[0]},${legendLoc[1]})`)

            let legend1 = legend.append('g')
                .attr("class", "legend1")
                .call(legend1function)
            let legend2 = legend.append("g")
                .attr("class", "legend2")
                .attr("transform", "translate(300, 0)")
                .call(legend2function);


            //paint title
            graph.append("text")
                .attr("x", width / 2)
                .attr("y", -150)
                .attr("dy", "0em")
                .attr('text-anchor', 'middle')
                .attr('stroke', 'black')
                .style("font-size", "22px")
                .attr('font-weight', 300)
                .text("SOOOOO MANY RAINY DAYS IN DALLAS!!!");


            graph.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(axisX)
                .append("text")
                .attr("x", width/2)
                .attr("y", 40)
                .attr('stroke', 'black')
                .attr('text-anchor', 'middle')
                .text("Time");

            graph.append("g")
                .attr("transform", `translate(${scaleX(minX)},0)`)
                .call(axisY)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", -50-scaleX(minX))
                .attr("x", -height/2)
                .attr('text-anchor', 'middle')
                .attr('stroke', 'black')
                .text('Temperature / °C');


            let bubbles = graph.selectAll("circle")
                .data(data)
                .enter();


            bubbles.append("circle")
                .filter(function(d) {return (parseFloat(d['PRCP']) > 0)})
                .attr("class", "bubble")
                .attr("cx", function(d) {return scaleX(d['Date'])})
                .attr("cy", function(d) {return scaleY(parseFloat(d['TAVG']))})
                .attr("r", function(d) {return scaleV(parseFloat(d['PRCP']))})
                .attr("fill", function(d) {return colorScale(d.type)});

        })






    }

    //Custom scale label:
    //https://d3-legend.susielu.com/
    function labelHelper({
                             i,
                             genLength,
                             generatedLabels,
                             labelDelimiter
                         }) {
        if(i === 0){
            return `≤ ${generatedLabels[i]}`
        }
        return generatedLabels[i];
    }



    main(svg);

}

a10a();
