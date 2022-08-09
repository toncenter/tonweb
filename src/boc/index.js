const {BitString} = require("./BitString");
const {Cell} = require("./Cell");
const {HashMap, PfxHashMap} = require("./HashMap");
const {
    loadBit,
    loadUint,
    loadInt,
    loadUintLEQ,
    loadMaybeRefX,
    loadUnary,
    loadHmLabel
} = require("./CellParsing");

class CellParser { };
CellParser.loadBit = loadBit;
CellParser.loadUint = loadUint;
CellParser.loadInt = loadInt;
CellParser.loadUintLEQ = loadUintLEQ;
CellParser.loadMaybeRefX = loadMaybeRefX;
CellParser.loadUnary = loadUnary;
CellParser.loadHmLabel = loadHmLabel;

module.exports = {BitString, Cell, HashMap, PfxHashMap, CellParser};
