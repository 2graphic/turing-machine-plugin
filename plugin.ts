function hidden(...args: any[]) { };

export class Nodes {
    /** Start State */
    isStartState: boolean;
    /** Accept State */
    isAcceptState: boolean;
    children: Edges[];

    private get image(): string {
        if (this.isStartState && this.isAcceptState) {
            return "start_accept_state.svg";
        }
        if (this.isAcceptState) {
            return "accept_state.svg";
        }
        if (this.isStartState) {
            return "start_state.svg";
        }
        return "";
    }

    private get origin(): { x: number, y: number } {
        return {
            x: this.isStartState ? 10 : 0,
            y: 0
        };
    }
}

export class Edges {
    read: string;
    write: string;
    move: "Right" | "Left";
    destination: Nodes;

    private get label() {
        return `${this.read};${this.write};${this.move[0]}`;
    }
}

export class Graph {
    nodes: Nodes[];
    blank: string;
}



export class Tape {
    @hidden data: string[];
    @hidden head: number;



    constructor(src: Iterable<string>, private blank: string) {
        this.data = [...src];
        this.head = 0;
    }

    atHead() {
        return this.data[this.head];
    }

    update(nv: string, dir: "Right" | "Left") {
        this.data[this.head] = nv;
        this.head += dir === 'Left' ? -1 : 1;
        if (this.head === this.data.length) {
            this.data.push(this.blank);
        }
        if (this.head === -1) {
            this.data.unshift(this.blank);
            this.head = 0;
        }
    }

    copy() {
        const t = new Tape(this.data, this.blank);
        t.head = this.head;
        return t;
    }

    toString() {
        let r = "... " + this.blank + " ";
        let i = 0;
        for (let i = 0; i < this.data.length; i++) {
            if (i === this.head) {
                r += "[" + this.data[i] + "]";
            } else {
                r += " " + this.data[i] + " ";
            }
        }

        r += " " + this.blank + " ...";
        return r;
    }
}

export class State {
    private active: Nodes[];

    tapes: [Nodes, string][];

    constructor( @hidden public states: [Tape, Nodes][]) {
        this.active = states.map(([_, n]) => n);
        this.tapes = states.map(([t, n]) => [n, t.toString()] as [Nodes, string]);
    }
}

export function start(input: Graph, data: string): State | boolean {
    const startStates = input.nodes.filter(n => n.isStartState);
    if (startStates.length === 0) {
        throw new Error("no start state");
    }

    return new State(startStates.map(n => [new Tape(data, input.blank), n] as [Tape, Nodes]));
}

export function step(current: State): State | boolean {
    const nextStates: [Tape, Nodes][] = [];

    for (const [tapeOriginal, node] of current.states) {
        if (node.isAcceptState) {
            return true;
        }

        const edges = node.children.filter(e => e.read === tapeOriginal.atHead());

        for (const edge of edges) {
            const tape = tapeOriginal.copy();
            tape.update(edge.write, edge.move);
            nextStates.push([tape, edge.destination]);
        }
    }

    if (nextStates.length === 0) {
        return false;
    }

    return new State(nextStates);
}