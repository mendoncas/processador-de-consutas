


const keywords = ["join", "where", "select", ";"]
const tablesNames = ["usuario", "contas", "tipoconta", "movimentacao", "tipomovimento", "categoria"]
const operators = ["=", ">", "<", "<=", ">=", "<>"]

const atributosTabelas = ["idusuario", "nome", "logradouro", "numero", "bairro", "cep", "UF", "datanascimento", 
"idcontas","Logradouro", "descricao", "tipoconta_idtipoconta", "usuario_idusuario", "saldoinicial",
"idtipoConta", "descricao","usuario_idusuario","tipoconta_idtipoconta",
"idmovimentacao", "datamovimentacao", "descricao", "tipomovimento_idtipomovimento", "categoria_idcategoria", "contas_idcontas", "valor",
"idtipomovimento", "descmovimentacao","idtipoConta",
"idcategoria", "desccategoria", "Descrição","uf","descrição"

]

function loadData(){
    for(i=0; i<100; i++)
        usuario.push(new Usuario())
}

function onSubmit(){
    parse(document.getElementById("command").value)
}

function parse(command){
    let s = command.replaceAll(',', '');
    s = s.split(" ")

    select = parseProjection(s)
    joins = parseJoin(s)
    where = parseSelection(s)
    graph(select, joins, where)
}

function graph(select, join, where){
    nodeArray = []
    lastTable = select.tables[0];

    select.tables.forEach(t => {
        nodeArray.push(new Operator(t, "TABLE"))
    })

    join.forEach(j => {
        nodeArray.push(new Operator(j.table, "TABLE"))
    })

    if(nodeArray.length > 1 && join.length == 0){
        produto = new Operator([], "PRODUTO CARTESIANO")
        nodeArray.forEach(c =>{
            produto.children.push(c)
            produto.params.push(c.params)
        })
        nodeArray.push(produto)
    }
    join.forEach(j =>{
        op = new Operator([j.table, lastTable], "JUNÇÃO")
        lastTable = j.table
        nodeArray.forEach(t => {
            if(op.params.includes( t.params))
                op.children.push(t)
        })
        nodeArray.push(op)
    })

    if(where != null){
        w = new Operator(where, "SELEÇÃO")
        w.children.push(nodeArray.slice(-1))
        nodeArray.push(w)
    }

    console.log("ordem de execução antes da aplicação de heurísticas 🤔")
    p = new Operator(select.params, "PROJEÇÃO")
    p.children.push(nodeArray.slice(-1))
    nodeArray.push(p)
    nodeArray.forEach(node => {
        if(!(node.operation == 'TABLE'))
            console.log(`operação: ${node.operation} com: ${node.params}`)
    })

    console.log('\n' )
    console.log("\nordem após otimização priorizando projeções e seleções 🤓")

    for(let i=0; i<nodeArray.length; i++){
        tt = []
        if(nodeArray[i].operation == 'SELEÇÃO' ||nodeArray[i].operation == 'PROJEÇÃO' ){
            for(let j =0; j< i; j++){
                if(nodeArray[j].operation == "TABLE")
                    tt.push(nodeArray[j].params)
            }
            console.log(`operação: ${nodeArray[i].operation} em: ${tt}, com: ${nodeArray[i].params}`)
        }
    }
    for(let k=0; k<nodeArray.length; k++){
        if(nodeArray[k].operation == 'JUNÇÃO' || nodeArray[k].operation == 'PRODUTO CARTESIANO')
            console.log(`operação: ${nodeArray[k].operation} em: ${nodeArray[k].params}, com ${nodeArray[k].params}`)
        }

    console.log('\n GRAFO NÃO OTIMIZADO 🌞 ')
    console.log(nodeArray.pop())
}

function parseProjection(command){
    s = false
    sParams = false
    params = []
    subQuery = []
    let checker = (arr, target) => target.every(v => arr.includes(v) || arr.includes(v.toLowerCase) || arr.includes(v.toUpperCase));

    if(command.includes("select") || command.includes("SELECT") || command.includes("Select")){
        command.forEach(e => {
            if(e.toLowerCase() == "from"){
                s = false
                sParams = true
            }
            if(s)
               params.push(e)
            else{
                if(keywords.includes(e))
                    sParams = false
                if(sParams)
                    subQuery.push(e)
            }
            if(e.toLowerCase() == "select")
                s = true
        });
        subQuery.shift()
        const uppercasedParams = params.map(atributos => atributos.toLowerCase());

        if(checker(tablesNames, subQuery)){
            if(checker(atributosTabelas,uppercasedParams)){
                return {params: params, tables: subQuery}  
            }else{
                alert("Atributos da tabela estão invalidos");
            }
        }else{
            alert("Tabela não encontrada no banco de dadaos");
        }
    }else{
        alert("Comando Inválido")
    }
}

function parseSelection(command){
    s = false
    expression = ""
    command.forEach(e=>{
        if(s)
            expression += " " + e
        if(e.toLowerCase() == "where")
            s = true
    })
    vetor_palavras = expression.split(" ")
    incluso = false
    if(s){
        for(i = 0 ; i < vetor_palavras.length; i++){
            if(operators.includes(vetor_palavras[i])){
                incluso = true
            }
        }
        if(incluso){
            return expression
        }else{
            alert("Comando Inválido na parte do Where")
        }
    }
}

function parseJoin(command){
    s = false
    joins = []
    expression = ""
    for(i=0; i< command.length; i++){
        if(command[i].toLowerCase()  == "join"){
            joins.push({
                table: command[i+1],
                condition: `${command[i+3]} ${command[i+4]} ${command[i+5]}`
            })
        }
    }
    return joins
}