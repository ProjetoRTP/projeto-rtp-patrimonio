# Atualização do sistema: feature de equipamentos genéricos

## 1. Contextualização

O sistema de patrimônio atualmente realiza o gerenciamento de equipamentos institucionais por meio de uma estrutura padronizada, na qual existe uma tabela principal de equipamentos e tabelas específicas para alguns tipos já definidos, como computadores, impressoras e periféricos.

Essa estrutura atende bem aos equipamentos previamente conhecidos, porém limita a expansão do sistema quando surgem novos tipos de equipamentos com características próprias, como roteadores, switches, fontes, notebooks, access points, servidores, nobreaks, câmeras IP, controladoras, entre outros.

Diante disso, propõe-se a criação de uma nova feature para permitir o cadastro de equipamentos genéricos e customizáveis. Essa funcionalidade deverá permitir que o usuário crie novos tipos de equipamentos, defina seus atributos específicos e cadastre itens patrimoniais seguindo tanto os campos padrão do sistema quanto os campos personalizados definidos para cada tipo.

## 2. Objetivo da feature

O objetivo desta atualização é permitir que o sistema seja mais flexível e escalável, possibilitando o cadastro de novos tipos de equipamentos sem a necessidade de alterar o banco de dados ou o código-fonte sempre que uma nova categoria for necessária.

Com essa feature, o usuário poderá criar tipos de equipamentos personalizados, como roteador, switch, fonte, notebook ou servidor, e definir quais informações específicas deverão ser preenchidas no cadastro de cada um.

## 3. Descrição geral da funcionalidade

A funcionalidade de equipamentos genéricos deverá permitir que o usuário cadastre novos modelos de tipo de equipamento, informando o nome do tipo e os atributos personalizados que farão parte daquele cadastro.

Por exemplo, ao criar o tipo de equipamento "Switch", o usuário poderá definir atributos como quantidade de portas, velocidade das portas, suporte a PoE e indicação se o equipamento é gerenciável. Já ao criar o tipo "Roteador", poderá definir atributos como velocidade, uso do equipamento, IP LAN, IP WAN, operadora e tipo de link.

Dessa forma, o sistema manterá os dados patrimoniais comuns para todos os equipamentos e permitirá o uso de campos específicos de acordo com o tipo criado pelo usuário.

## 4. Dados padrão de todo equipamento

Independentemente do tipo criado, todo equipamento deverá manter os dados padrão já utilizados pelo sistema de patrimônio.

Os dados padrão são:

- Patrimônio/tombamento/número de série;
- Tipo do equipamento;
- Endereço IP, quando aplicável;
- Observação;
- Data de aquisição;
- Valor;
- Status;
- Setor;
- Subsetor;
- Colaborador responsável;
- Data de cadastro;
- Data de exclusão lógica, quando aplicável.

Esses campos continuam sendo obrigatórios ou opcionais conforme as regras atuais do sistema. A feature de equipamentos genéricos não substitui o cadastro padrão, mas complementa esse cadastro com atributos personalizados.

**Nota sobre a coexistência arquitetural:** A feature de equipamentos genéricos não substituirá as tabelas legadas já consolidadas (`computadores`, `impressoras`, `perifericos`). Esses três tipos permanecerão funcionando com suas telas e lógicas atuais de herança. O novo sistema genérico atuará de forma híbrida e em paralelo, sendo aplicado exclusivamente para os **novos** tipos de equipamentos criados dinamicamente.

## 5. Criação de tipos de equipamentos personalizados

O sistema deverá permitir que o usuário crie novos tipos de equipamentos.

Exemplos de tipos que poderão ser criados:

- Roteador;
- Switch;
- Fonte;
- Notebook;
- Servidor;
- Access point;
- Nobreak;
- Câmera IP;
- Monitor;
- Controladora wireless.

Cada tipo criado deverá possuir um nome, uma descrição opcional e uma lista de atributos personalizados.

## 6. Criação de atributos personalizados

O sistema deverá permitir que o usuário defina atributos personalizados para cada tipo de equipamento.

Cada atributo deverá possuir, no mínimo:

- Nome do atributo;
- Tipo do dado;
- Obrigatoriedade;
- Valor padrão, quando aplicável;
- Lista de opções, quando aplicável;
- Descrição ou orientação de preenchimento.

## 7. Tipos de dados dos atributos personalizados

O sistema deverá permitir a criação de atributos com diferentes tipos de dados, como:

- Texto curto;
- Texto longo;
- Número inteiro;
- Número decimal;
- Data;
- Sim ou não;
- Lista de opções;
- Endereço IP;
- Endereço MAC;
- Patrimônio de outro equipamento vinculado.

Essa flexibilidade permitirá que cada tipo de equipamento tenha campos adequados à sua realidade técnica.

## 8. Exemplos de aplicação

### 8.1. Exemplo: tipo de equipamento "Switch"

O usuário poderá criar o tipo "Switch" e definir os seguintes atributos personalizados:

| Atributo | Tipo de dado | Obrigatório | Exemplo |
|---|---|---|---|
| Quantidade de portas | Número inteiro | Sim | 24 |
| Velocidade das portas | Lista de opções | Sim | Fast Ethernet, Gigabit Ethernet |
| Gerenciável | Sim ou não | Não | Sim |
| Possui PoE | Sim ou não | Não | Não |
| IP de gerenciamento | Endereço IP | Não | 192.168.0.10 |

### 8.2. Exemplo: tipo de equipamento "Roteador"

O usuário poderá criar o tipo "Roteador" e definir os seguintes atributos personalizados:

| Atributo | Tipo de dado | Obrigatório | Exemplo |
|---|---|---|---|
| Velocidade | Lista de opções | Não | Fast, Giga |
| Uso do equipamento | Lista de opções | Sim | Servidor, uso pessoal |
| IP LAN | Endereço IP | Não | 192.168.1.1 |
| IP WAN | Endereço IP | Não | 10.0.0.2 |
| Operadora | Texto curto | Não | Claro |
| Tipo de link | Lista de opções | Não | Fibra, rádio, cabo, 4G, 5G |

### 8.3. Exemplo: tipo de equipamento "Fonte"

O usuário poderá criar o tipo "Fonte" e definir os seguintes atributos personalizados:

| Atributo | Tipo de dado | Obrigatório | Exemplo |
|---|---|---|---|
| Voltagem | Lista de opções | Sim | 110V, 220V, bivolt |
| Amperagem | Número decimal | Não | 2.5 |
| Compatibilidade | Texto curto | Não | Roteador Intelbras |
| Equipamento vinculado | Patrimônio vinculado | Não | PAT-00052 |

### 8.4. Exemplo: tipo de equipamento "Notebook"

O usuário poderá criar o tipo "Notebook" e definir os seguintes atributos personalizados:

| Atributo | Tipo de dado | Obrigatório | Exemplo |
|---|---|---|---|
| Processador | Texto curto | Sim | Intel Core i5 |
| Memória RAM | Texto curto | Sim | 8 GB |
| Armazenamento | Texto curto | Sim | SSD 256 GB |
| Sistema operacional | Texto curto | Não | Windows 11 |
| Possui carregador | Sim ou não | Não | Sim |

## 9. Funcionamento esperado no cadastro

Ao cadastrar um equipamento, o usuário deverá primeiro preencher os dados padrão do sistema, como patrimônio, status, setor, subsetor e observações.

Em seguida, deverá selecionar o tipo de equipamento. Caso o tipo selecionado possua atributos personalizados, o sistema deverá exibir dinamicamente os campos correspondentes.

Por exemplo:

- Se o usuário selecionar "Switch", o sistema exibirá campos como quantidade de portas e velocidade das portas;
- Se selecionar "Roteador", exibirá campos como IP LAN, IP WAN e tipo de uso;
- Se selecionar "Notebook", exibirá campos como processador, memória RAM e armazenamento;
- Se selecionar "Fonte", exibirá campos como voltagem, amperagem e equipamento vinculado.

## 10. Requisitos funcionais

### RF01 — Criar tipo de equipamento personalizado

O sistema deverá permitir que o usuário crie novos tipos de equipamentos personalizados, informando nome, descrição e status do tipo.

Exemplo: roteador, switch, fonte, notebook, servidor ou access point.

### RF02 — Editar tipo de equipamento personalizado

O sistema deverá permitir a edição dos tipos de equipamentos personalizados cadastrados, possibilitando alterar nome, descrição e status.

A edição deverá respeitar regras de segurança para não comprometer equipamentos já cadastrados com aquele tipo.

### RF03 — Desativar tipo de equipamento personalizado

O sistema deverá permitir a desativação lógica de tipos de equipamentos personalizados.

A desativação deverá impedir novos cadastros com aquele tipo, mas não deverá remover os equipamentos já cadastrados anteriormente.

### RF04 — Criar atributos personalizados para um tipo de equipamento

O sistema deverá permitir que o usuário crie atributos personalizados vinculados a um tipo de equipamento.

Cada atributo deverá conter nome, tipo de dado, obrigatoriedade, descrição e, quando necessário, opções de preenchimento.

### RF05 — Definir tipo de dado do atributo

O sistema deverá permitir que o usuário defina o tipo de dado de cada atributo personalizado.

Os tipos de dados disponíveis deverão incluir texto, número, data, sim ou não, lista de opções, endereço IP, endereço MAC e vínculo com outro equipamento.

### RF06 — Definir obrigatoriedade do atributo

O sistema deverá permitir que o usuário defina se um atributo personalizado será obrigatório ou opcional no cadastro do equipamento.

Caso o atributo seja obrigatório, o sistema não deverá permitir salvar o equipamento sem o preenchimento desse campo.

### RF07 — Criar atributos com lista de opções

O sistema deverá permitir a criação de atributos do tipo lista de opções.

Exemplo: para o atributo "Velocidade das portas", o usuário poderá cadastrar opções como "Fast Ethernet", "Gigabit Ethernet" e "10G".

### RF08 — Cadastrar equipamento com tipo personalizado

O sistema deverá permitir o cadastro de equipamentos utilizando tipos personalizados criados pelo usuário.

O equipamento deverá manter os dados padrão do sistema e também armazenar os valores dos atributos personalizados definidos para o tipo selecionado.

### RF09 — Exibir campos personalizados dinamicamente

O sistema deverá exibir dinamicamente os campos personalizados no formulário de cadastro e edição de equipamentos, conforme o tipo de equipamento selecionado.

### RF10 — Editar valores dos atributos personalizados

O sistema deverá permitir a edição dos valores preenchidos nos atributos personalizados de um equipamento.

A edição deverá respeitar o tipo de dado e as regras de obrigatoriedade definidas no cadastro do atributo.

### RF11 — Consultar equipamentos por atributos personalizados

O sistema deverá permitir a consulta de equipamentos utilizando atributos personalizados como filtros.

Exemplo: buscar switches com 24 portas, roteadores de uso servidor ou notebooks com 8 GB de RAM.

### RF12 — Listar equipamentos por tipo personalizado

O sistema deverá permitir a listagem de equipamentos por tipo personalizado.

Exemplo: listar todos os equipamentos do tipo roteador, switch, fonte ou notebook.

### RF13 — Vincular equipamento a outro equipamento

O sistema deverá permitir que um atributo personalizado seja utilizado para vincular um equipamento a outro.

Exemplo: uma fonte poderá ser vinculada a um roteador por meio do patrimônio do equipamento ou por referência interna do sistema. *(Nota: Este vínculo genérico não substitui e sim convive em paralelo com a tabela `equipamentos_componentes` já existente, que continuará sendo usada estritamente para vincular periféricos a computadores).*

### RF14 — Manter funcionalidades padrão para equipamentos genéricos

O sistema deverá garantir que equipamentos criados a partir de tipos personalizados possam utilizar as funcionalidades padrão já existentes, como:

- Cadastro;
- Consulta;
- Edição;
- Movimentação;
- Manutenção;
- Mudança de status;
- Desativação lógica;
- Histórico;
- Relatórios.

### RF15 — Gerar relatórios com atributos personalizados

O sistema deverá permitir a geração de relatórios contendo tanto os dados padrão dos equipamentos quanto os atributos personalizados definidos para cada tipo.

### RF16 — Validar dados dos atributos personalizados

O sistema deverá validar os valores preenchidos nos atributos personalizados de acordo com o tipo de dado configurado.

Exemplo: campos do tipo número não devem aceitar texto; campos de endereço IP devem seguir formato válido; campos obrigatórios não podem ficar vazios.

### RF17 — Impedir duplicidade de nome de tipo

O sistema deverá impedir o cadastro de dois tipos de equipamentos personalizados com o mesmo nome.

Essa validação evita duplicidade e confusão na organização dos equipamentos.

### RF18 — Impedir duplicidade de atributo dentro do mesmo tipo

O sistema deverá impedir que dois atributos com o mesmo nome sejam cadastrados dentro do mesmo tipo de equipamento.

Por exemplo, o tipo "Switch" não deve possuir dois atributos chamados "Quantidade de portas".

### 10.1. Requisitos Não Funcionais (RNF)

#### RNF01 — Performance de Busca em Campos Dinâmicos
As buscas e relatórios que envolvem filtros por atributos personalizados (RF11 e RF15) devem ser executadas utilizando as funções nativas de JSON do banco de dados (ex: `JSON_EXTRACT` no MySQL 8.0) para garantir um tempo de resposta aceitável mesmo com grande volume de dados.

#### RNF02 — Coexistência com Modelagem Legada
A nova funcionalidade de tipos genéricos não deve quebrar ou exigir refatoração na lógica das tabelas já consolidadas (`computadores`, `impressoras` e `perifericos`). Ambas as abordagens devem funcionar em paralelo.

#### RNF03 — Segurança e Prevenção de SQL Injection
A geração de *queries* dinâmicas no backend para a filtragem de atributos deve utilizar *Prepared Statements* ou mecanismos seguros do ORM/Framework para evitar ataques na manipulação do JSON.

#### RNF04 — Dupla Validação (Front e Back)
A validação das regras dos atributos dinâmicos (RF16) deve ocorrer rigorosamente no backend para proteção da integridade dos dados, mas também deve ser replicada no frontend de forma visual para otimizar a experiência do usuário.

## 11. Sugestão de modelagem conceitual

Para implementar essa feature, recomenda-se manter a tabela principal de equipamentos como base do sistema e criar tabelas auxiliares para representar os tipos personalizados, os atributos definidos pelo usuário e os valores preenchidos para cada equipamento.

Para implementar essa feature em harmonia com a arquitetura atual (que já prevê herança para PCs e impressoras), recomenda-se a seguinte abordagem de banco de dados, aproveitando o suporte nativo do MySQL 8.0 a campos JSON:

### 11.1. Alteração na Tabela Atual: equipamentos

Será necessário realizar um `ALTER TABLE` na tabela principal de `equipamentos` existente:
1. **Modificar o campo `tipo`:** Atualmente, ele é restrito por um `ENUM('computador', 'impressora', 'periferico')`. Ele deverá ser convertido em uma chave estrangeira (ex: `tipo_equipamento_id`) apontando para a nova tabela de tipos. Os valores antigos podem ser migrados como registros base nessa nova tabela para não quebrar a lógica atual, ou o ENUM pode ser afrouxado.
2. **Adicionar o campo `atributos_dinamicos`:** Uma nova coluna do tipo `JSON`. Esta coluna armazenará um objeto contendo todos os campos dinâmicos preenchidos (ex: `{"quantidade_portas": 24, "poe": true}`). O uso do JSON no MySQL 8.0 dispensa a criação de tabelas complexas de Entity-Attribute-Value (EAV), simplifica o backend e garante altíssima performance para gerar relatórios com filtros (RF15).

### 11.2. Nova Tabela: tipos_equipamento

Responsável por armazenar os tipos de equipamento criados pelo usuário.

Campos sugeridos:

- id;
- nome;
- descrição;
- ativo;
- data_criacao.

### 11.3. Nova Tabela: atributos_tipo_equipamento

Responsável por armazenar as "regras" dos atributos personalizados de cada tipo. O backend lerá esta tabela para saber como validar os dados que chegarão no JSON dinâmico.

Campos sugeridos:

- id;
- tipo_equipamento_id;
- nome (chave a ser salva no JSON, ex: `qtd_portas`);
- tipo_dado;
- obrigatorio;
- valor_padrao;
- opcoes;
- ativo;
- data_criacao.

## 12. Comportamento esperado

O comportamento esperado da feature é que o sistema permita a criação de novos tipos de equipamentos sem depender de alterações manuais no banco de dados ou no código.

Assim, caso a instituição precise cadastrar um novo tipo, como "Access Point", o próprio usuário poderá criar esse tipo, definir seus atributos e começar a cadastrar equipamentos com essas características.

Isso torna o sistema mais adaptável à realidade da organização, reduz a necessidade de manutenção técnica para cada novo equipamento e mantém a padronização patrimonial já existente.

## 13. Benefícios da atualização

A criação da feature de equipamentos genéricos trará os seguintes benefícios:

- Maior flexibilidade no cadastro de equipamentos;
- Redução da necessidade de alterações no banco de dados para novos tipos;
- Melhor adaptação à realidade da instituição;
- Padronização dos dados patrimoniais;
- Possibilidade de expansão futura;
- Melhoria no controle técnico dos equipamentos;
- Manutenção das funcionalidades já existentes;
- Maior organização dos dados específicos de cada tipo de equipamento.

## 14. Resultado esperado

Ao final da atualização, o sistema deverá permitir que o usuário crie tipos de equipamentos personalizados e defina atributos próprios para cada tipo. Os equipamentos cadastrados com esses tipos deverão continuar utilizando as funcionalidades padrão do sistema, como movimentação, manutenção, histórico, status, consulta e relatórios.

Dessa forma, o sistema deixará de depender apenas de categorias fixas e passará a oferecer um modelo mais flexível, capaz de atender diferentes necessidades patrimoniais e técnicas da instituição.