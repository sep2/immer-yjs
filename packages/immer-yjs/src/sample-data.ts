// Copied from https://opensource.adobe.com/Spry/samples/data_region/JSONDataSetSample.html

export const data1Id = '0001'
export const data2Id = '0002'
export const data3Id = '0003'

const data1 = {
    id: data1Id,
    type: 'donut',
    name: 'Cake',
    ppu: 0.55,
    batters: {
        batter: [
            { id: '1001', type: 'Regular' },
            { id: '1002', type: 'Chocolate' },
            { id: '1003', type: 'Blueberry' },
            { id: '1004', type: "Devil's Food" },
        ],
    },
    topping: [
        { id: '5001', type: 'None' },
        { id: '5002', type: 'Glazed' },
        { id: '5005', type: 'Sugar' },
        { id: '5007', type: 'Powdered Sugar' },
        { id: '5006', type: 'Chocolate with Sprinkles' },
        { id: '5003', type: 'Chocolate' },
        { id: '5004', type: 'Maple' },
    ],
}

const data2 = {
    id: data2Id,
    type: 'donut',
    name: 'Raised',
    ppu: 0.55,
    batters: {
        batter: [{ id: '1001', type: 'Regular' }],
    },
    topping: [
        { id: '5001', type: 'None' },
        { id: '5002', type: 'Glazed' },
        { id: '5005', type: 'Sugar' },
        { id: '5003', type: 'Chocolate' },
        { id: '5004', type: 'Maple' },
    ],
}

const data3 = {
    id: data3Id,
    type: 'donut',
    name: 'Old Fashioned',
    ppu: 0.55,
    batters: {
        batter: [
            { id: '1001', type: 'Regular' },
            { id: '1002', type: 'Chocolate' },
        ],
    },
    topping: [
        { id: '5001', type: 'None' },
        { id: '5002', type: 'Glazed' },
        { id: '5003', type: 'Chocolate' },
        { id: '5004', type: 'Maple' },
    ],
}

const sampleArray = [data1, data2, data3]

const sampleObject = {
    [data1.id]: data1,
    [data2.id]: data2,
    [data3.id]: data3,
}

function deepClone(x: any) {
    return JSON.parse(JSON.stringify(x))
}

export type SampleArrayType = typeof sampleArray
export type SampleObjectType = typeof sampleObject

export function createSampleArray(): SampleArrayType {
    return deepClone(sampleArray)
}

export function createSampleObject(): SampleObjectType {
    return deepClone(sampleObject)
}
