import * as svgson from "svgson";
import * as fs from "fs";

interface ICocktail {
    //Values needed for SVG
    name: string;
    glass: string;
    liquidColour: string;
    ice: string;
    garnish: string;
    garnishPos: string;
    //Other
    ingredients?: IIngredient[];
    steps?: string[];
    imageAddress?: string;
}

interface IIngredient {
    name: string;
    quantity: number;
    units: string;
}

const cocktail1: ICocktail = {
    name: "Old Fashioned",
    glass: "Lowball",
    liquidColour: "#976f29",
    ice: "Big",
    garnish: "Orange Peel",
    garnishPos: "Garnish"
}

const cocktail2: ICocktail = {
    name: "Dirty Martini",
    glass: "Martini",
    liquidColour: "#c7ffdc",
    ice: "None",
    garnish: "Olive",
    garnishPos: "Garnish"
}

const cocktail3: ICocktail = {
    name: "Gin and Tonic",
    glass: "Highball",
    liquidColour: "#000000",
    ice: "Stack",
    garnish: "None",
    garnishPos: "None"
}

const cocktail4: ICocktail = {
    name: "Cantaritos",
    glass: "CopperMug",
    liquidColour: "#976f29",
    ice: "None",
    garnish: "Orange Peel",
    garnishPos: "Garnish"
}

const cocktails: ICocktail[] = [];

cocktails.push(cocktail1, cocktail2, cocktail3, cocktail4);

const openSVG = async (svgAddress: string): Promise<svgson.INode | undefined> => {
    try {
        const svg = await fs.promises.readFile(svgAddress, "utf8");
        const json = await svgson.parse(svg);
        return json;
    } catch (err) {
        console.error(err);
    }
}

const mergeSVG = async (baseJSON: svgson.INode | undefined, newSVGAddress: string, groupID: string) => {
    try {
        const newJSON = await openSVG(newSVGAddress);

        if (newJSON && baseJSON) {
            const group = baseJSON.children.find(c => c.attributes.id === groupID);
            if (group) {
                group.children.push(...newJSON.children);
            }
            return baseJSON;
        }
    } catch (err) {
        console.log(err);
    }
}

const changeLiquidColour = async (json: svgson.INode | undefined, colour: string) => {
    if (json) {
        const liquidPath = json.children.find(c => c.attributes.id === "Liquid");
        const liquidOverlayPath = json.children.find(c => c.attributes.id === "LiquidOverlay");
        if (liquidPath && liquidOverlayPath) {
            liquidPath.attributes.fill = colour;
            liquidOverlayPath.attributes.fill = colour;
        }
        return json;
    }   
}

const createCocktailSVG = async (cocktail: ICocktail) => {
    try {
        let json = await openSVG("Templates\\Glasses\\" + cocktail.glass + "Glass.svg");
        
        json = await changeLiquidColour(json, cocktail.liquidColour);

        if (cocktail.garnish !== "None") {
            json = await mergeSVG(json, "Templates\\Garnish\\" + cocktail.garnish.replace(" ", "") + "Garnish.svg", cocktail.garnishPos);
        }
        if (cocktail.ice !== "None") {
            json = await mergeSVG(json, "Templates\\Ice\\" + cocktail.ice.replace(" ", "")  + "Ice.svg", "Ice");
        }
        
        if (json) {
            const newSvg = await svgson.stringify(json);
            await fs.promises.writeFile("Created\\" + cocktail.name + ".svg", newSvg);
            console.log("Cocktail created for " + cocktail.name);
        }
    } catch (err) {
        console.log(err);
    }
}

cocktails.forEach(cocktail => {
    createCocktailSVG(cocktail);
});