import os

def write_yaml(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + "\n")

def generate():
    base = "/home/eduardo/Projetos prog/Softex/projeto-rtp-patrimonio/backend/docs"
    
    # ----------------------------------------------------
    # USERS
    # ----------------------------------------------------
    write_yaml(f"{base}/user/create_user.yml", """
tags: [Usuários]
summary: Cria um novo usuário (Apenas Admin)
security: [{Bearer: []}]
consumes: [application/json]
produces: [application/json]
parameters:
  - in: body
    name: dados
    required: true
    schema:
      type: object
      required: [nome, cpf, email, data_nascimento, senha]
      properties:
        nome: {type: string, example: "Carlos Administrador"}
        cpf: {type: string, example: "12345678910"}
        email: {type: string, example: "carlos@empresa.com"}
        data_nascimento: {type: string, format: date, example: "1990-01-01"}
        senha: {type: string, example: "senhaSegura123"}
        perfil: {type: string, example: "admin"}
responses:
  201: {description: Sucesso}
  400: {description: Erro de validação}
    """)
    write_yaml(f"{base}/user/list_users.yml", """
tags: [Usuários]
summary: Lista todos os usuários
security: [{Bearer: []}]
responses:
  200: {description: Lista retornada}
    """)
    write_yaml(f"{base}/user/get_user.yml", """
tags: [Usuários]
summary: Busca usuário pelo ID
security: [{Bearer: []}]
parameters: [{in: path, name: url_id, type: integer, required: true}]
responses:
  200: {description: Usuário encontrado}
    """)
    write_yaml(f"{base}/user/update_user.yml", """
tags: [Usuários]
summary: Atualiza dados do usuário
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
      properties:
        nome: {type: string}
        email: {type: string}
        perfil: {type: string}
responses:
  200: {description: Atualizado}
    """)
    write_yaml(f"{base}/user/delete_user.yml", """
tags: [Usuários]
summary: Desativa um usuário
security: [{Bearer: []}]
parameters: [{in: path, name: url_id, type: integer, required: true}]
responses:
  200: {description: Desativado}
    """)
    write_yaml(f"{base}/user/update_password.yml", """
tags: [Usuários]
summary: Atualiza a própria senha
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
      required: [senha_atual, nova_senha]
      properties:
        senha_atual: {type: string}
        nova_senha: {type: string}
responses:
  200: {description: Senha atualizada}
    """)
    write_yaml(f"{base}/user/request_reset_password.yml", """
tags: [Usuários]
summary: Solicita recuperação de senha via email
parameters:
  - in: body
    name: dados
    schema:
      type: object
      required: [email]
      properties: {email: {type: string}}
responses:
  200: {description: Email enviado}
    """)
    write_yaml(f"{base}/user/reset_password.yml", """
tags: [Usuários]
summary: Reseta a senha com token recebido
parameters:
  - in: body
    name: dados
    schema:
      type: object
      required: [email, token, nova_senha]
      properties:
        email: {type: string}
        token: {type: string}
        nova_senha: {type: string}
responses:
  200: {description: Senha resetada}
    """)

    # ----------------------------------------------------
    # COLLABORATORS
    # ----------------------------------------------------
    for endpoint, method, sum_str in [('create_collaborator','POST','Cria colaborador'),('list_collaborators','GET','Lista colaboradores'),('get_collaborator','GET','Obtém colaborador'),('update_collaborator','PUT','Atualiza colaborador'),('delete_collaborator','DELETE','Desativa colaborador')]:
        param = ""
        if method in ['POST', 'PUT']:
            param = """
parameters:
  - in: body
    name: dados
    schema:
      type: object
      properties:
        nome: {type: string}
        cpf: {type: string}
        email: {type: string}
        telefone: {type: string}
        setor_id: {type: integer}"""
            if method == 'PUT':
                param = """
parameters:
  - in: path
    name: url_id
    type: integer
    required: true
  - in: body
    name: dados
    schema:
      type: object
      properties:
        nome: {type: string}
        cpf: {type: string}
        email: {type: string}
        telefone: {type: string}
        setor_id: {type: integer}"""
        elif method in ['GET', 'DELETE'] and endpoint != 'list_collaborators':
            param = "parameters: [{in: path, name: url_id, type: integer, required: true}]"
            
        write_yaml(f"{base}/collaborator/{endpoint}.yml", f"""
tags: [Colaboradores]
summary: {sum_str}
security: [{{Bearer: []}}]
{param}
responses:
  200: {{description: Sucesso}}
  201: {{description: Criado}}
        """)

    # ----------------------------------------------------
    # EQUIPMENTS
    # ----------------------------------------------------
    def write_equip(name, tag, create_props):
        for ep, meth, sum_str in [('create','POST',f'Cadastra {tag}'),('list','GET',f'Lista {tag}'),('get','GET',f'Detalha {tag}'),('update','PUT',f'Atualiza {tag}'),('delete','DELETE',f'Deleta {tag}')]:
            param = ""
            if meth == 'POST' or meth == 'PUT':
                param = f"""
parameters:
  - in: body
    name: dados
    schema:
      type: object
      properties:
        num_patrimonio: {{type: string}}
        setor_id: {{type: integer}}
        subsetor_id: {{type: integer}}
{create_props}"""
                if meth == 'PUT': 
                    param = f"""
parameters:
  - in: path
    name: url_id
    type: integer
    required: true
  - in: body
    name: dados
    schema:
      type: object
      properties:
        num_patrimonio: {{type: string}}
        setor_id: {{type: integer}}
        subsetor_id: {{type: integer}}
{create_props}"""
            elif meth in ['GET', 'DELETE'] and ep != 'list':
                param = "parameters: [{in: path, name: url_id, type: integer, required: true}]"
                
            write_yaml(f"{base}/equipments/{ep}_{name}.yml", f"""
tags: [{tag.capitalize()}]
summary: {sum_str}
security: [{{Bearer: []}}]
{param}
responses:
  200: {{description: Sucesso}}
  201: {{description: Criado}}
            """)
            
    write_equip("computer", "Computadores", "        os: {type: string}\n        mem_cpu: {type: string}\n        mem_ram: {type: string}\n        armazenamento: {type: string}")
    write_equip("printer", "Impressoras", "        ip: {type: string}\n        modelo: {type: string}")
    write_equip("peripheral", "Periféricos", "        tipo_periferico: {type: string}\n        modelo: {type: string}")

    # ----------------------------------------------------
    # SUBSECTORS
    # ----------------------------------------------------
    for ep, meth, sum_str in [('create_subsector','POST','Cria subsetor'),('list_subsectors','GET','Lista subsetores'),('get_subsector','GET','Detalha subsetor'),('update_subsector','PUT','Atualiza subsetor'),('delete_subsector','DELETE','Desativa subsetor')]:
        param = ""
        if meth in ['POST', 'PUT']:
            param = """
parameters:
  - in: body
    name: dados
    schema:
      type: object
      properties:
        nome: {type: string}
        setor_id: {type: integer}"""
            if meth == 'PUT': 
                param = """
parameters:
  - in: path
    name: url_id
    type: integer
    required: true
  - in: body
    name: dados
    schema:
      type: object
      properties:
        nome: {type: string}
        setor_id: {type: integer}"""
        elif meth in ['GET', 'DELETE'] and ep != 'list_subsectors':
            param = "parameters: [{in: path, name: url_id, type: integer, required: true}]"
        elif ep == 'list_subsectors':
            param = "parameters: [{in: query, name: setor_id, type: integer}]"
            
        write_yaml(f"{base}/sectors/{ep}.yml", f"""
tags: [Subsetores]
summary: {sum_str}
security: [{{Bearer: []}}]
{param}
responses:
  200: {{description: Sucesso}}
  201: {{description: Criado}}
        """)

    # ----------------------------------------------------
    # MAINTENANCE
    # ----------------------------------------------------
    for ep, sum_str, param in [
        ('create_maintenance','Abre manutenção','parameters:\n  - in: body\n    name: dados\n    schema:\n      type: object\n      properties:\n        equipamento_id: {type: integer}\n        motivo: {type: string}'),
        ('list_maintenances','Lista manutenções ativas',''),
        ('get_maintenance','Detalha manutenção','parameters: [{in: path, name: url_id, type: integer, required: true}]'),
        ('cancel_maintenance','Cancela manutenção','parameters: [{in: path, name: url_id, type: integer, required: true}]'),
        ('finish_maintenance','Finaliza manutenção','parameters:\n  - in: path\n    name: url_id\n    type: integer\n    required: true\n  - in: body\n    name: dados\n    schema:\n      type: object\n      properties:\n        descricao_resolucao: {type: string}')
    ]:
        write_yaml(f"{base}/maintenance/{ep}.yml", f"""
tags: [Manutenção]
summary: {sum_str}
security: [{{Bearer: []}}]
{param}
responses:
  200: {{description: Sucesso}}
  201: {{description: Sucesso}}
        """)

    # ----------------------------------------------------
    # MOVEMENTS
    # ----------------------------------------------------
    write_yaml(f"{base}/movements/create_movement.yml", """
tags: [Movimentação]
summary: Cria termo de responsabilidade ou transferência
security: [{Bearer: []}]
parameters:
  - in: body
    name: dados
    schema:
      type: object
      properties:
        equipamento_id: {type: integer}
        colaborador_id: {type: integer}
        local_origem: {type: string}
        setor_origem_id: {type: integer}
        setor_destino_id: {type: integer}
responses:
  201: {description: Sucesso}
    """)
    write_yaml(f"{base}/movements/list_movements.yml", "tags: [Movimentação]\nsummary: Lista movimentações pendentes\nsecurity: [{Bearer: []}]\nresponses: {200: {description: Sucesso}}")
    write_yaml(f"{base}/movements/get_movement.yml", "tags: [Movimentação]\nsummary: Detalha movimentação\nsecurity: [{Bearer: []}]\nparameters: [{in: path, name: url_id, type: integer, required: true}]\nresponses: {200: {description: Sucesso}}")
    write_yaml(f"{base}/movements/finish_movement.yml", "tags: [Movimentação]\nsummary: Assina termo de movimentação\nsecurity: [{Bearer: []}]\nparameters: [{in: path, name: url_id, type: integer, required: true}]\nresponses: {200: {description: Sucesso}}")
    write_yaml(f"{base}/movements/cancel_movement.yml", "tags: [Movimentação]\nsummary: Cancela movimentação\nsecurity: [{Bearer: []}]\nparameters: [{in: path, name: url_id, type: integer, required: true}]\nresponses: {200: {description: Sucesso}}")

    # ----------------------------------------------------
    # HISTORY
    # ----------------------------------------------------
    write_yaml(f"{base}/history/list_history.yml", "tags: [Histórico]\nsummary: Lista o histórico global\nsecurity: [{Bearer: []}]\nresponses: {200: {description: Sucesso}}")
    write_yaml(f"{base}/history/get_history.yml", "tags: [Histórico]\nsummary: Detalha um log do histórico\nsecurity: [{Bearer: []}]\nparameters: [{in: path, name: url_id, type: integer, required: true}]\nresponses: {200: {description: Sucesso}}")
    write_yaml(f"{base}/history/get_history_by_equipment.yml", "tags: [Histórico]\nsummary: Lista histórico por equipamento\nsecurity: [{Bearer: []}]\nparameters: [{in: path, name: url_id, type: integer, required: true}]\nresponses: {200: {description: Sucesso}}")
    write_yaml(f"{base}/history/get_history_by_movement_type.yml", "tags: [Histórico]\nsummary: Lista histórico por tipo de movimentação\nsecurity: [{Bearer: []}]\nparameters: [{in: path, name: type_name, type: string, required: true}]\nresponses: {200: {description: Sucesso}}")


if __name__ == '__main__':
    generate()
