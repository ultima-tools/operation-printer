import { ApolloLink } from '@apollo/client';


const r = (operation) => (key, value) => {
    const { query: { loc: { source: { body } } } } = operation;
    const regex = /@client @export\(as: "period"\)/gi;

    if (typeof value === 'string') {
        const derictive = regex.test(body) ? ' @export' : '';
        return `${value}${derictive}`;
    }
    return value;
};

const variablesRow = (operation) => {
    if (Object.keys(operation.variables).length) {
        const variables = JSON.stringify(operation.variables, r(operation), 4);

        return `\x1b[1;33mVariables :\x1b[0m ${variables}`;
    }
    return '';
};

const fragmentsRow = (operation) => {
    const { query: { definitions } } = operation;
    const II = definitions.reduce((acc, item) => {
        const isFragementType = item.kind === 'FragmentDefinition';
        if (isFragementType) { return [...acc, item.name.value]; }
        return acc;
    }, []);

    if (!II.length) {
        return '';
    }

    const badge = II.length > 1 ? 'Includes fragments :' : 'Include fragment :';
    const fragmentsNames = II.join(', ');
    return `\x1b[1;33m${badge} \x1b[0m${fragmentsNames}`;
};

const operationRow = (operation) => {
    const { query: { definitions }, operationName } = operation;
    const [{ operation: operationType }] = definitions;
    return `\u001b[1;102;30m ${operationType.toUpperCase()} \x1b[0m \x1b[1m${operationName}\x1b[0m`;
};

const print = (operation) => {
    // const handlers = [operationRow];
    const header = operationRow(operation);
    const rows = [];

    [fragmentsRow, variablesRow].forEach((handler) => {
        const r = handler(operation);
        if (r) rows.push(r);
    });

    const log = rows.length ? console.groupCollapsed : console.log;
    f(operation);
    try {
        log(header);
        rows.forEach((r) => {
            console.log(r);
        });
        console.groupEnd();
    } catch (err) {
        console.log(err);
    }
};

function operationPrinter(operation, forward) {
    print(operation);
    return forward(operation);
}

export const printer = new ApolloLink(operationPrinter);

