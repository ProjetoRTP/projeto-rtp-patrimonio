import os
import textwrap

def create_yaml(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(textwrap.dedent(content).strip() + '\n')

def main():
    base_dir = "/home/eduardo/Projetos prog/Softex/projeto-rtp-patrimonio/backend/docs"
    
    # --- SUBSETORS ---
    create_yaml(f"{base_dir}/sectors/subsectors_create.yml", """
    tags: [Subsetores]
    summary: Cria um novo subsetor
    security: [{Bearer: []}]
    consumes: [application/json]
    parameters:
      - in: body
        name: dados
        required: true
        schema:
          type: object
          properties:
            nome: {type: string}
            setor_id: {type: integer}
    responses:
      201: {description: Subsetor criado}
    """)
    create_yaml(f"{base_dir}/sectors/subsectors_get_all.yml", """
    tags: [Subsetores]
    summary: Lista subsetores (opcionalmente por setor)
    security: [{Bearer: []}]
    parameters:
      - in: query
        name: setor_id
        type: integer
    responses:
      200: {description: Lista de subsetores}
    """)
    create_yaml(f"{base_dir}/sectors/subsectors_get.yml", """
    tags: [Subsetores]
    summary: Busca um subsetor pelo ID
    security: [{Bearer: []}]
    parameters:
      - in: path
        name: url_id
        type: integer
        required: true
    responses:
      200: {description: Subsetor retornado}
    """)
    create_yaml(f"{base_dir}/sectors/subsectors_update.yml", """
    tags: [Subsetores]
    summary: Atualiza um subsetor
    security: [{Bearer: []}]
    consumes: [application/json]
    parameters:
      - in: path
        name: url_id
        type: integer
        required: true
      - in: body
        name: dados
        schema:
          type: object
          properties: {nome: {type: string}, setor_id: {type: integer}}
    responses:
      200: {description: Atualizado com sucesso}
    """)
    create_yaml(f"{base_dir}/sectors/subsectors_delete.yml", """
    tags: [Subsetores]
    summary: Desativa um subsetor
    security: [{Bearer: []}]
    parameters:
      - in: path
        name: url_id
        type: integer
        required: true
    responses:
      200: {description: Desativado}
    """)

    # --- COMPUTERS ---
    create_yaml(f"{base_dir}/equipments/computers_get_all.yml", """
    tags: [Computadores]
    summary: Lista todos os computadores
    security: [{Bearer: []}]
    responses:
      200: {description: Lista retornada}
    """)
    create_yaml(f"{base_dir}/equipments/computers_get.yml", """
    tags: [Computadores]
    summary: Busca computador pelo ID
    security: [{Bearer: []}]
    parameters:
      - in: path
        name: url_id
        type: integer
        required: true
    responses:
      200: {description: Computador encontrado}
    """)
    create_yaml(f"{base_dir}/equipments/computers_update.yml", """
    tags: [Computadores]
    summary: Atualiza computador
    security: [{Bearer: []}]
    parameters:
      - in: path
        name: url_id
        type: integer
        required: true
      - in: body
        name: dados
        schema:
          type: object
    responses:
      200: {description: Atualizado}
    """)
    create_yaml(f"{base_dir}/equipments/computers_delete.yml", """
    tags: [Computadores]
    summary: Deleta computador
    security: [{Bearer: []}]
    parameters:
      - in: path
        name: url_id
        type: integer
        required: true
    responses:
      200: {description: Deletado}
    """)

    # --- MAINTENANCE ---
    create_yaml(f"{base_dir}/maintenance/create.yml", """
    tags: [Manutenção]
    summary: Cria registro de manutenção
    security: [{Bearer: []}]
    parameters:
      - in: body
        name: dados
        schema:
          type: object
          properties: {equipamento_id: {type: integer}, motivo: {type: string}}
    responses:
      201: {description: Manutenção registrada}
    """)
    create_yaml(f"{base_dir}/maintenance/get_all.yml", """
    tags: [Manutenção]
    summary: Lista manutenções ativas
    security: [{Bearer: []}]
    responses:
      200: {description: Lista retornada}
    """)
    create_yaml(f"{base_dir}/maintenance/get.yml", """
    tags: [Manutenção]
    summary: Detalha manutenção
    security: [{Bearer: []}]
    parameters: [{in: path, name: id, type: integer, required: true}]
    responses:
      200: {description: Retornado com sucesso}
    """)
    create_yaml(f"{base_dir}/maintenance/cancel.yml", """
    tags: [Manutenção]
    summary: Cancela manutenção
    security: [{Bearer: []}]
    parameters: [{in: path, name: id, type: integer, required: true}]
    responses:
      200: {description: Cancelada}
    """)
    create_yaml(f"{base_dir}/maintenance/finish.yml", """
    tags: [Manutenção]
    summary: Finaliza manutenção
    security: [{Bearer: []}]
    parameters: 
      - in: path
        name: id
        type: integer
        required: true
      - in: body
        name: dados
        schema:
          type: object
          properties: {descricao_resolucao: {type: string}}
    responses:
      200: {description: Finalizada}
    """)

    # --- MOVEMENTS ---
    create_yaml(f"{base_dir}/movements/create.yml", """
    tags: [Movimentação]
    summary: Cria movimentação de equipamento
    security: [{Bearer: []}]
    parameters:
      - in: body
        name: dados
        schema:
          type: object
    responses:
      201: {description: Criada}
    """)
    create_yaml(f"{base_dir}/movements/get_all.yml", """
    tags: [Movimentação]
    summary: Lista movimentações ativas
    security: [{Bearer: []}]
    responses:
      200: {description: Lista retornada}
    """)
    create_yaml(f"{base_dir}/movements/get.yml", """
    tags: [Movimentação]
    summary: Detalha movimentação
    security: [{Bearer: []}]
    parameters: [{in: path, name: id, type: integer, required: true}]
    responses:
      200: {description: Retornado com sucesso}
    """)
    create_yaml(f"{base_dir}/movements/cancel.yml", """
    tags: [Movimentação]
    summary: Cancela movimentação
    security: [{Bearer: []}]
    parameters: [{in: path, name: id, type: integer, required: true}]
    responses:
      200: {description: Cancelada}
    """)
    create_yaml(f"{base_dir}/movements/finish.yml", """
    tags: [Movimentação]
    summary: Finaliza movimentação
    security: [{Bearer: []}]
    parameters: [{in: path, name: id, type: integer, required: true}]
    responses:
      200: {description: Finalizada}
    """)

if __name__ == '__main__':
    main()
